from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseViewSet, LessonViewSet

router = DefaultRouter()
router.register(r'courses', CourseViewSet, basename='course')

urlpatterns = [
    path('', include(router.urls)),
    path('courses/<int:course_id>/lessons/', LessonViewSet.as_view({'get': 'list', 'post': 'create'}), name='lesson-list'),
    path('courses/<int:course_id>/lessons/<int:pk>/', LessonViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='lesson-detail'),
    path('courses/<int:course_id>/lessons/<int:pk>/complete/', LessonViewSet.as_view({'post': 'complete'}), name='lesson-complete'),
    path('courses/<int:course_id>/lessons/<int:pk>/generate-practice/', LessonViewSet.as_view({'post': 'generate_practice'}), name='lesson-generate-practice'),
    path('courses/<int:course_id>/lessons/<int:pk>/quiz/', LessonViewSet.as_view({'get': 'quiz', 'post': 'quiz'}), name='lesson-quiz'),
    path('courses/<int:course_id>/lessons/<int:pk>/create_quiz/', LessonViewSet.as_view({'post': 'create_quiz'}), name='lesson-create-quiz'),
]
