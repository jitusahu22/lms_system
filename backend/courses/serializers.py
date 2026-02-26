from rest_framework import serializers
from .models import Course, Lesson, Enrollment, LessonCompletion, Quiz, Question, Choice, Certificate, CourseRating, QuizAttempt
from users.serializers import UserSerializer

class LessonSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()
    has_quiz = serializers.SerializerMethodField()
    quiz_passed = serializers.SerializerMethodField()

    class Meta:
        model = Lesson
        fields = ('id', 'course', 'title', 'content', 'order', 'is_completed', 'has_quiz', 'quiz_passed')
        read_only_fields = ('course',)
    
    def get_is_completed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return LessonCompletion.objects.filter(student=request.user, lesson=obj).exists()
        return False

    def get_has_quiz(self, obj):
        return hasattr(obj, 'quiz')

    def get_quiz_passed(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated and hasattr(obj, 'quiz'):
            return QuizAttempt.objects.filter(student=request.user, quiz=obj.quiz, passed=True).exists()
        return False

class CourseSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    lessons = LessonSerializer(many=True, read_only=True)
    enrollment_count = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    is_enrolled = serializers.SerializerMethodField()
    average_rating = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    class Meta:
        model = Course
        fields = ('id', 'title', 'description', 'instructor_name', 'created_at', 'lessons', 
                  'enrollment_count', 'progress', 'is_enrolled', 'average_rating', 'user_rating')

    def get_enrollment_count(self, obj):
        return obj.enrollments.count()
    
    def get_progress(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        
        total_lessons = obj.lessons.count()
        if total_lessons == 0:
            return 0
            
        completed_lessons = LessonCompletion.objects.filter(
            student=request.user, 
            lesson__course=obj
        ).count()
        
        return int((completed_lessons / total_lessons) * 100)

    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Enrollment.objects.filter(student=request.user, course=obj).exists()
        return False
        
    def get_average_rating(self, obj):
        from django.db.models import Avg
        result = obj.ratings.aggregate(Avg('rating'))
        return round(result['rating__avg'], 1) if result['rating__avg'] else 0

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating_obj = obj.ratings.filter(student=request.user).first()
            if rating_obj:
                return rating_obj.rating
        return None

class EnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Enrollment
        fields = ('id', 'student', 'course', 'enrolled_at')

class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text', 'is_correct')

class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'choices')

class QuizSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'questions')

class CertificateSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.username')
    course_title = serializers.ReadOnlyField(source='course.title')

    class Meta:
        model = Certificate
        fields = ('id', 'student_name', 'course_title', 'issued_at', 'certificate_id')
