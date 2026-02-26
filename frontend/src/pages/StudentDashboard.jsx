import React, { useState, useEffect } from 'react';
import { getCourses, enrollCourse, getCertificate } from '../services/apiService';
import { Link } from 'react-router-dom';
import { PlayCircle, BookOpen, Star } from 'lucide-react';
import { showSuccess } from '../utils/notify';

const StudentDashboard = () => {
    const [courses, setCourses] = useState([]);

    const fetchCourses = async () => {
        try {
            const res = await getCourses();
            setCourses(res);
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleEnroll = async (courseId) => {
        try {
            await enrollCourse(courseId);
            showSuccess('Successfully enrolled in the course!');
            fetchCourses();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDownloadCertificate = async (courseId, courseTitle) => {
        try {
            const response = await getCertificate(courseId);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Certificate_${courseTitle}.pdf`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("Failed to download certificate. Please ensure you have completed the course.");
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>Student Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {courses.map(course => (
                    <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{course.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 'bold', fontSize: '0.9rem' }}>
                                <Star size={16} fill="#fbbf24" /> {course.average_rating > 0 ? course.average_rating : 'New'}
                            </div>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Instructor: {course.instructor_name}</p>
                        <p style={{ color: 'var(--text-main)', flex: 1, marginBottom: '1.5rem' }}>{course.description.substring(0, 100)}...</p>

                        {course.is_enrolled ? (
                            <div style={{ background: 'var(--background)', padding: '1rem', borderRadius: '0.5rem', marginTop: 'auto' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <span>Course Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div style={{ height: '8px', background: 'var(--border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '1rem' }}>
                                    <div style={{ height: '100%', background: 'var(--success)', width: `${course.progress}%`, transition: 'width 0.3s ease' }}></div>
                                </div>
                                <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
                                    <Link to={`/courses/${course.id}`} className="btn btn-primary" style={{ width: '100%', display: 'flex', gap: '0.5rem' }}>
                                        <PlayCircle size={18} /> Continue Learning
                                    </Link>
                                    {course.progress === 100 && (
                                        <button onClick={() => handleDownloadCertificate(course.id, course.title)} className="btn" style={{ background: '#e0e7ff', color: 'var(--primary)', border: '1px solid var(--primary)', width: '100%', cursor: 'pointer' }}>
                                            Download Certificate
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}><BookOpen size={16} /> {course.lessons.length} Lessons</span>
                                <button onClick={() => handleEnroll(course.id)} className="btn btn-primary">Enroll Now</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudentDashboard;
