from django.http import FileResponse
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Course, Lesson, Enrollment, LessonCompletion, Quiz, Question, Choice, QuizAttempt, Certificate, CourseRating
from .serializers import CourseSerializer, LessonSerializer, QuizSerializer
from .ai_utils import generate_practice_questions
from .pdf_utils import generate_certificate_pdf

class IsInstructorOrReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and request.user.role == 'instructor'

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.instructor == request.user

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all().order_by('-created_at')
    serializer_class = CourseSerializer
    permission_classes = [IsInstructorOrReadOnly]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def enroll(self, request, pk=None):
        course = self.get_object()
        if course.instructor == request.user:
            return Response({"detail": "Instructors cannot enroll in their own courses."}, status=status.HTTP_400_BAD_REQUEST)
        
        enrollment, created = Enrollment.objects.get_or_create(student=request.user, course=course)
        if not created:
            return Response({"detail": "Already enrolled."}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"detail": "Successfully enrolled."}, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def progress_summary(self, request, pk=None):
        course = self.get_object()
        if course.instructor != request.user:
            return Response({"detail": "Only the instructor can view class progress."}, status=status.HTTP_403_FORBIDDEN)
        
        enrollments = Enrollment.objects.filter(course=course)
        students_data = []
        total_lessons = course.lessons.count()
        
        for enrollment in enrollments:
            completed = LessonCompletion.objects.filter(student=enrollment.student, lesson__course=course).count()
            progress = int((completed / total_lessons) * 100) if total_lessons > 0 else 0
            students_data.append({
                'student_name': enrollment.student.username,
                'email': enrollment.student.email,
                'progress': progress,
            })
            
        return Response({"students": students_data})

    @action(detail=True, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def certificate(self, request, pk=None):
        course = self.get_object()
        
        # Check if student is enrolled
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({"detail": "You must be enrolled to get a certificate."}, status=status.HTTP_403_FORBIDDEN)
            
        # Check if 100% completed
        total_lessons = course.lessons.count()
        completed = LessonCompletion.objects.filter(student=request.user, lesson__course=course).count()
        
        if total_lessons == 0 or completed < total_lessons:
            return Response({"detail": "Course is not 100% completed yet."}, status=status.HTTP_400_BAD_REQUEST)
            
        cert, created = Certificate.objects.get_or_create(student=request.user, course=course)
        
        pdf_buffer = generate_certificate_pdf(
            request.user.username,
            course.title,
            cert.issued_at.strftime("%B %d, %Y"),
            cert.certificate_id
        )
        return FileResponse(pdf_buffer, as_attachment=True, filename=f"Certificate_{course.title}.pdf")

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        course = self.get_object()
        
        # Must be enrolled
        if not Enrollment.objects.filter(student=request.user, course=course).exists():
            return Response({"detail": "You must be enrolled to rate this course."}, status=status.HTTP_403_FORBIDDEN)
            
        rating_value = request.data.get('rating')
        if not rating_value or not str(rating_value).isdigit() or int(rating_value) < 1 or int(rating_value) > 5:
            return Response({"detail": "Invalid rating. Must be between 1 and 5."}, status=status.HTTP_400_BAD_REQUEST)
        
        rating, created = CourseRating.objects.update_or_create(
            student=request.user, course=course,
            defaults={'rating': int(rating_value)}
        )
        return Response({"detail": "Course rated successfully.", "rating": rating.rating}, status=status.HTTP_200_OK)

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        course_id = self.kwargs.get('course_id')
        if course_id:
            return Lesson.objects.filter(course_id=course_id)
        return Lesson.objects.none()

    def perform_create(self, serializer):
        course_id = self.kwargs.get('course_id')
        course = Course.objects.get(id=course_id)
        if course.instructor != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You can only add lessons to your own courses.")
        serializer.save(course=course)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def complete(self, request, course_id=None, pk=None):
        lesson = self.get_object()
        course = lesson.course
        if not Enrollment.objects.filter(student=request.user, course=course).exists() and course.instructor != request.user:
            return Response({"detail": "You must be enrolled in the course to complete lessons."}, status=status.HTTP_403_FORBIDDEN)
        
        completion, created = LessonCompletion.objects.get_or_create(student=request.user, lesson=lesson)
        return Response({"detail": "Lesson marked as complete."}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def generate_practice(self, request, course_id=None, pk=None):
        lesson = self.get_object()
        # Verify enrollment
        course = lesson.course
        if not Enrollment.objects.filter(student=request.user, course=course).exists() and course.instructor != request.user:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        result = generate_practice_questions(lesson.content)
        if "error" in result:
            return Response(result, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        return Response(result, status=status.HTTP_200_OK)
        
    @action(detail=True, methods=['get', 'post'], permission_classes=[permissions.IsAuthenticated])
    def quiz(self, request, course_id=None, pk=None):
        lesson = self.get_object()
        if not hasattr(lesson, 'quiz'):
            return Response({"detail": "No quiz for this lesson."}, status=status.HTTP_404_NOT_FOUND)
            
        if request.method == 'GET':
            return Response(QuizSerializer(lesson.quiz).data)
            
        # POST: Submit quiz answers
        # Format expects: {"answers": {"question_id": "choice_id"}}
        answers = request.data.get('answers', {})
        score = 0
        total = lesson.quiz.questions.count()
        
        for q_id, c_id in answers.items():
            try:
                choice = Choice.objects.get(id=c_id, question_id=q_id)
                if choice.is_correct:
                    score += 1
            except Choice.DoesNotExist:
                pass
                
        passed = (score / total) >= 0.8 if total > 0 else True
        QuizAttempt.objects.create(student=request.user, quiz=lesson.quiz, score=score, passed=passed)
        
        if passed:
            LessonCompletion.objects.get_or_create(student=request.user, lesson=lesson)
        
        # Prepare correct answers payload
        correct_answers = []
        for q in lesson.quiz.questions.all():
            correct_choice = q.choices.filter(is_correct=True).first()
            if correct_choice:
                correct_answers.append({
                    "question_id": q.id,
                    "question_text": q.text,
                    "correct_choice_id": correct_choice.id,
                    "correct_choice_text": correct_choice.text
                })

        return Response({
            "score": score,
            "total": total,
            "passed": passed,
            "correct_answers": correct_answers
        })

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def create_quiz(self, request, course_id=None, pk=None):
        lesson = self.get_object()
        if lesson.course.instructor != request.user:
            return Response({"detail": "Only the instructor can create a quiz."}, status=status.HTTP_403_FORBIDDEN)
        
        quiz_data = request.data
        quiz, created = Quiz.objects.get_or_create(lesson=lesson, defaults={'title': quiz_data.get('title', 'Quiz for ' + lesson.title)})
        if not created:
            quiz.title = quiz_data.get('title', 'Quiz for ' + lesson.title)
            quiz.save()
            quiz.questions.all().delete()
            
        for q_data in quiz_data.get('questions', []):
            question = Question.objects.create(quiz=quiz, text=q_data.get('text'))
            for c_data in q_data.get('choices', []):
                Choice.objects.create(question=question, text=c_data.get('text'), is_correct=c_data.get('is_correct', False))
                
        return Response({"detail": "Quiz created successfully."}, status=status.HTTP_201_CREATED)

