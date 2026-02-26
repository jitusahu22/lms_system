import api from '../api';
import { showError } from '../utils/notify';

const handleError = (e) => {
    const errorMsg = e.response?.data?.detail || e.response?.data?.message || e.message || 'An unexpected error occurred';
    showError(errorMsg);
    throw e;
};

// Auth Services
export const getMe = async () => {
    const response = await api.get('auth/me/').catch(handleError);
    return response ? response.data : {};
};

export const loginUser = async (credentials) => {
    const response = await api.post('auth/login/', credentials).catch(handleError);
    return response ? response : {};
};

export const registerUser = async (userData) => {
    const response = await api.post('auth/register/', userData).catch(handleError);
    return response ? response : {};
};

// Course Services
export const getCourses = async () => {
    const response = await api.get('courses/').catch(handleError);
    return response ? response.data : [];
};

export const getCourseById = async (id) => {
    const response = await api.get(`courses/${id}/`).catch(handleError);
    return response ? response.data : {};
};

export const createCourse = async (data) => {
    const response = await api.post('courses/', data).catch(handleError);
    return response ? response.data : {};
};

export const enrollCourse = async (id) => {
    const response = await api.post(`courses/${id}/enroll/`).catch(handleError);
    return response ? response.data : {};
};

export const getProgressSummary = async (id) => {
    const response = await api.get(`courses/${id}/progress_summary/`).catch(handleError);
    return response ? response.data : {};
};

export const getCertificate = async (id) => {
    const response = await api.get(`courses/${id}/certificate/`, { responseType: 'blob' }).catch(handleError);
    return response ? response : {};
};

export const rateCourse = async (id, rating) => {
    const response = await api.post(`courses/${id}/rate/`, { rating }).catch(handleError);
    return response ? response.data : {};
};

// Lesson Services
export const createLesson = async (courseId, data) => {
    const response = await api.post(`courses/${courseId}/lessons/`, data).catch(handleError);
    return response ? response.data : {};
};

export const markComplete = async (courseId, lessonId) => {
    const response = await api.post(`courses/${courseId}/lessons/${lessonId}/complete/`).catch(handleError);
    return response ? response.data : {};
};

export const generatePractice = async (courseId, lessonId) => {
    const response = await api.post(`courses/${courseId}/lessons/${lessonId}/generate-practice/`).catch(handleError);
    return response ? response.data : {};
};

// Quiz Services
export const getQuiz = async (courseId, lessonId) => {
    const response = await api.get(`courses/${courseId}/lessons/${lessonId}/quiz/`).catch(handleError);
    return response ? response.data : {};
};

export const submitQuiz = async (courseId, lessonId, answers) => {
    const response = await api.post(`courses/${courseId}/lessons/${lessonId}/quiz/`, { answers }).catch(handleError);
    return response ? response.data : {};
};

export const createQuiz = async (courseId, lessonId, data) => {
    const response = await api.post(`courses/${courseId}/lessons/${lessonId}/create_quiz/`, data).catch(handleError);
    return response ? response.data : {};
};
