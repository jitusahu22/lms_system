import React, { useState, useEffect } from 'react';
import { getCourses, createCourse, getProgressSummary } from '../services/apiService';
import { Link } from 'react-router-dom';
import { PlusCircle, Users, BookOpen, Star } from 'lucide-react';
import { showSuccess } from '../utils/notify';

const InstructorDashboard = () => {
    const [courses, setCourses] = useState([]);
    const [newCourse, setNewCourse] = useState({ title: '', description: '' });
    const [showCreate, setShowCreate] = useState(false);
    const [uniqueStudentsCount, setUniqueStudentsCount] = useState(0);
    const [overallAvgProgress, setOverallAvgProgress] = useState(0);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const coursesData = await getCourses();

            const progressPromises = coursesData.map(c => getProgressSummary(c.id));
            const summaries = await Promise.all(progressPromises);

            let allStudents = new Set();
            let totalProgressSum = 0;
            let totalEnrollmentsWithProgress = 0;

            const enrichedCourses = coursesData.map((course, index) => {
                const summary = summaries[index];
                const students = summary.students || [];
                students.forEach(s => allStudents.add(s.student_name));

                const courseTotalProgress = students.reduce((sum, s) => sum + s.progress, 0);
                const courseAvgProgress = students.length > 0 ? Math.round(courseTotalProgress / students.length) : 0;

                totalProgressSum += courseAvgProgress;
                if (students.length > 0) totalEnrollmentsWithProgress++;

                return { ...course, studentsList: students, avgProgress: courseAvgProgress };
            });

            const overallAvg = totalEnrollmentsWithProgress > 0 ? Math.round(totalProgressSum / totalEnrollmentsWithProgress) : 0;

            setCourses(enrichedCourses);
            setUniqueStudentsCount(allStudents.size);
            setOverallAvgProgress(overallAvg);
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await createCourse(newCourse);
            showSuccess('Course created successfully!');
            setNewCourse({ title: '', description: '' });
            setShowCreate(false);
            fetchCourses();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.5rem)', margin: 0 }}>Instructor Dashboard</h1>
                <button className="btn btn-primary" onClick={() => setShowCreate(!showCreate)}>
                    <PlusCircle size={20} style={{ marginRight: '0.5rem' }} /> {showCreate ? 'Cancel' : 'Create Course'}
                </button>
            </div>

            {/* Statistical Overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-hover) 100%)', color: 'white' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500', opacity: 0.9 }}>Total Courses</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{courses.length}</div>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--secondary) 0%, #059669 100%)', color: 'white' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500', opacity: 0.9 }}>Total Students</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {uniqueStudentsCount}
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', color: 'white' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500', opacity: 0.9 }}>Total Lessons</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>
                        {courses.reduce((acc, course) => acc + (course.lessons?.length || 0), 0)}
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', color: 'white' }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', fontWeight: '500', opacity: 0.9 }}>Avg Completion</h3>
                    <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{overallAvgProgress}%</div>
                </div>
            </div>

            {showCreate && (
                <div className="card" style={{ marginBottom: '2rem', background: 'var(--surface)' }}>
                    <h3 style={{ marginTop: 0 }}>Create New Course</h3>
                    <form onSubmit={handleCreateCourse} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <input className="input" placeholder="Course Title" value={newCourse.title} onChange={e => setNewCourse({ ...newCourse, title: e.target.value })} required />
                        <textarea className="input" placeholder="Course Description" value={newCourse.description} onChange={e => setNewCourse({ ...newCourse, description: e.target.value })} required rows={4} />
                        <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Course</button>
                    </form>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {courses.map(course => (
                    <div key={course.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{course.title}</h3>
                        <p style={{ color: 'var(--text-muted)', flex: 1, marginBottom: '1.5rem' }}>{course.description.substring(0, 100)}...</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}><Users size={16} /> {course.enrollment_count}</span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontWeight: 'bold' }}>
                                <Star size={16} fill="#fbbf24" /> {course.average_rating > 0 ? course.average_rating : 'New'}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-muted)' }}><BookOpen size={16} /> {course.lessons.length}</span>
                            <Link to={`/courses/${course.id}`} className="btn" style={{ background: 'var(--background)' }}>Manage</Link>
                        </div>
                    </div>
                ))}
                {courses.length === 0 && !showCreate && (
                    <p style={{ color: 'var(--text-muted)', gridColumn: '1 / -1', textAlign: 'center', padding: '3rem' }}>You haven't created any courses yet.</p>
                )}
            </div>
        </div>
    );
};

export default InstructorDashboard;
