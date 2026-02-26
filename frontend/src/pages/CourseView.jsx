import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    getCourseById, getProgressSummary, createLesson,
    markComplete, generatePractice, getQuiz,
    submitQuiz, createQuiz, rateCourse
} from '../services/apiService';
import { AuthContext } from '../context/AuthContext';
import { CheckCircle, Circle, PlayCircle, PlusCircle, ArrowLeft, BookOpen, Brain, Upload, Star, X } from 'lucide-react';
import { showSuccess } from '../utils/notify';

const CourseView = () => {
    const { courseId } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [showAddLesson, setShowAddLesson] = useState(false);
    const [newLesson, setNewLesson] = useState({ title: '', content: '', order: 1 });
    const [studentsProgress, setStudentsProgress] = useState([]);

    // AI and Quiz states
    const [aiQuestions, setAiQuestions] = useState(null);
    const [generatingAI, setGeneratingAI] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [quizAnswers, setQuizAnswers] = useState({});
    const [quizResult, setQuizResult] = useState(null);
    const [newQuizData, setNewQuizData] = useState({ title: '', question: '', options: ['', '', '', ''], correctIndex: 0 });
    const [showAddQuiz, setShowAddQuiz] = useState(false);

    // Rating State
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [hoverRating, setHoverRating] = useState(0);
    const [selectedRating, setSelectedRating] = useState(0);

    useEffect(() => {
        fetchCourseDetails();
        if (user?.role === 'instructor') {
            fetchStudentsProgress();
        }
    }, [courseId, user]);

    // Reset AI & Quiz states on lesson change
    useEffect(() => {
        setAiQuestions(null);
        setQuizData(null);
        setQuizAnswers({});
        setQuizResult(null);
    }, [activeLesson]);

    const fetchCourseDetails = async () => {
        try {
            const res = await getCourseById(courseId);
            setCourse(res);
            if (res.lessons.length > 0 && !activeLesson) {
                setActiveLesson(res.lessons[0]);
            }
            if (activeLesson) {
                const refreshedLesson = res.lessons.find(l => l.id === activeLesson.id);
                if (refreshedLesson) setActiveLesson(refreshedLesson);
            }
            setNewLesson(prev => ({ ...prev, order: res.lessons.length + 1 }));
            return res;
        } catch (e) {
            console.error(e);
            navigate('/');
        }
    };

    const fetchStudentsProgress = async () => {
        try {
            const res = await getProgressSummary(courseId);
            setStudentsProgress(res.students);
        } catch (e) {
            console.error(e);
        }
    };

    const handleAddLesson = async (e) => {
        e.preventDefault();
        try {
            await createLesson(courseId, newLesson);
            setNewLesson({ title: '', content: '', order: newLesson.order + 1 });
            setShowAddLesson(false);
            fetchCourseDetails();
        } catch (e) {
            console.error(e);
            alert("Error adding lesson: " + (e.response?.data ? JSON.stringify(e.response.data) : e.message));
        }
    };

    const handleMarkComplete = async (lessonId) => {
        try {
            await markComplete(courseId, lessonId);
            showSuccess('Lesson marked as completed!');
            const updatedCourse = await fetchCourseDetails();
            // Show rating modal if not rated yet
            if (updatedCourse && updatedCourse.user_rating === null && !showRatingModal) {
                setShowRatingModal(true);
            }
        } catch (e) {
            console.error(e);
        }
    };

    const handleGeneratePractice = async () => {
        // Instructor only AI generation
        if (!activeLesson || user.role !== 'instructor') return;
        setGeneratingAI(true);
        try {
            const res = await generatePractice(courseId, activeLesson.id);
            showSuccess('AI practice questions generated successfully!');
            setAiQuestions(res.questions);
        } catch (e) {
            console.error(e);
            alert("Error generating questions.");
        } finally {
            setGeneratingAI(false);
        }
    };

    const handleTakeQuiz = async () => {
        if (!activeLesson) return;
        try {
            const res = await getQuiz(courseId, activeLesson.id);
            setQuizData(res);
        } catch (e) {
            console.error(e);
            alert("Error loading quiz.");
        }
    };

    const handleSubmitQuiz = async () => {
        if (!activeLesson || !quizData) return;
        try {
            const res = await submitQuiz(courseId, activeLesson.id, quizAnswers);
            showSuccess('Quiz submitted successfully!');
            setQuizResult(res);
            if (res.passed) {
                const updatedCourse = await fetchCourseDetails(); // updates completion status
                if (updatedCourse && updatedCourse.user_rating === null && !showRatingModal) {
                    setShowRatingModal(true);
                }
            }
        } catch (e) {
            console.error(e);
            alert("Failed to submit quiz.");
        }
    };

    const handleSaveAIQuiz = async () => {
        if (!activeLesson || !aiQuestions) return;
        try {
            const payload = {
                title: `Required Quiz: ${activeLesson.title}`,
                questions: aiQuestions.map(q => {
                    const corrIndex = Math.max(0, q.options.findIndex(opt => opt === q.answer));
                    return {
                        text: q.question,
                        choices: q.options.map((opt, i) => ({ text: opt, is_correct: i === corrIndex }))
                    };
                })
            };
            await createQuiz(courseId, activeLesson.id, payload);
            alert("AI Practice saved as the Required Quiz!");
            setAiQuestions(null);
            fetchCourseDetails();
        } catch (e) {
            console.error(e);
            alert("Failed to save AI quiz.");
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                title: newQuizData.title,
                questions: [{
                    text: newQuizData.question,
                    choices: newQuizData.options.map((opt, i) => ({ text: opt, is_correct: i === parseInt(newQuizData.correctIndex) }))
                }]
            };
            await createQuiz(courseId, activeLesson.id, payload);
            alert("Quiz created/updated!");
            setShowAddQuiz(false);
            fetchCourseDetails(); // Reload lesson to get has_quiz
        } catch (e) {
            console.error(e);
            alert("Failed to create quiz.");
        }
    };

    const getEmbedUrl = (url) => {
        if (!url) return '';
        let embedUrl = url;
        if (url.includes('youtube.com/watch?v=')) {
            embedUrl = url.replace('watch?v=', 'embed/').split('&')[0];
        } else if (url.includes('youtu.be/')) {
            embedUrl = url.replace('youtu.be/', 'youtube.com/embed/').split('?')[0];
        }
        return embedUrl;
    };

    const handleRateCourse = async () => {
        if (selectedRating === 0) return;
        try {
            await rateCourse(courseId, selectedRating);
            setShowRatingModal(false);
            fetchCourseDetails();
        } catch (e) {
            console.error(e);
            alert("Rating failed");
        }
    };

    if (!course) return <div style={{ textAlign: 'center', marginTop: '4rem' }}>Loading course...</div>;

    return (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
            <button onClick={() => navigate(-1)} className="btn" style={{ marginBottom: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} /> Back to Dashboard
            </button>

            <div className={`responsive-grid ${user.role === 'instructor' && course.instructor_name === user.username && !showAddLesson ? 'instructor-grid' : ''}`} style={{ gap: '1.5rem', alignItems: 'stretch' }}>
                {/* Sidebar */}
                <div className="card fixed-sidebar" style={{ padding: '0', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ padding: '1.5rem', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>{course.title}</h2>
                        {user.role === 'student' && (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>
                                    <span>Progress</span>
                                    <span>{course.progress}%</span>
                                </div>
                                <div style={{ height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: 'var(--success)', width: `${course.progress}%`, transition: 'width 0.3s' }}></div>
                                </div>
                            </div>
                        )}
                        {/* Course Rating Display */}
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24' }}>
                            <Star size={18} fill="#fbbf24" />
                            <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{course.average_rating > 0 ? course.average_rating : 'New'}</span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                {course.user_rating ? `(You rated ${course.user_rating})` : ''}
                            </span>
                        </div>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {course.lessons.map((lesson, idx) => (
                            <div
                                key={lesson.id}
                                onClick={() => setActiveLesson(lesson)}
                                style={{
                                    padding: '1rem 1.5rem',
                                    borderBottom: '1px solid var(--border)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    background: activeLesson?.id === lesson.id ? 'var(--background)' : 'var(--surface)',
                                    borderLeft: activeLesson?.id === lesson.id ? '4px solid var(--primary)' : '4px solid transparent'
                                }}
                            >
                                {user.role === 'student' ? (
                                    lesson.is_completed ? <CheckCircle size={18} color="var(--success)" /> :
                                        (lesson.has_quiz && lesson.quiz_passed ? <CheckCircle size={18} color="var(--success)" /> : <Circle size={18} color="var(--text-muted)" />)
                                ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>{idx + 1}.</span>
                                )}
                                <span style={{ fontWeight: activeLesson?.id === lesson.id ? '600' : '400' }}>{lesson.title}</span>
                            </div>
                        ))}
                        {course.lessons.length === 0 && <p style={{ padding: '1.5rem', color: 'var(--text-muted)', textAlign: 'center' }}>No lessons yet.</p>}
                    </div>

                    {user.role === 'instructor' && course.instructor_name === user.username && (
                        <div style={{ padding: '1rem' }}>
                            <button
                                onClick={() => setShowAddLesson(!showAddLesson)}
                                className="btn btn-primary"
                                style={{ width: '100%', display: 'flex', gap: '0.5rem' }}
                            >
                                <PlusCircle size={18} /> {showAddLesson ? 'Cancel' : 'Add Lesson'}
                            </button>
                        </div>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="scrollable-column" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    {showAddLesson ? (
                        <div className="card">
                            <h2 style={{ marginTop: 0 }}>Add New Lesson</h2>
                            <form onSubmit={handleAddLesson} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <input className="input" placeholder="Lesson Title" value={newLesson.title} onChange={e => setNewLesson({ ...newLesson, title: e.target.value })} required />
                                <textarea className="input" placeholder="Lesson Content (Text or Video URL)" value={newLesson.content} onChange={e => setNewLesson({ ...newLesson, content: e.target.value })} required rows={6} />
                                <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Save Lesson</button>
                            </form>
                        </div>
                    ) : activeLesson ? (
                        <div className="card" style={{ minHeight: '50vh', display: 'flex', flexDirection: 'column' }}>
                            <h1 style={{ marginTop: 0, fontSize: '2rem' }}>{activeLesson.title}</h1>
                            <div style={{ flex: 1, padding: '1.5rem 0', fontSize: '1.1rem', lineHeight: '1.6' }}>
                                {activeLesson.content.startsWith('http') ? (
                                    <iframe width="100%" height="400" src={getEmbedUrl(activeLesson.content)} frameBorder="0" allowFullScreen style={{ borderRadius: 'var(--radius)' }}></iframe>
                                ) : (
                                    <p style={{ whiteSpace: 'pre-wrap' }}>{activeLesson.content}</p>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem', flexWrap: 'wrap' }}>
                                {user.role === 'student' && !activeLesson.is_completed && !activeLesson.has_quiz && (
                                    <button onClick={() => handleMarkComplete(activeLesson.id)} className="btn btn-primary" style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.5rem' }}>
                                        <CheckCircle size={20} /> Mark as Complete
                                    </button>
                                )}
                                {user.role === 'student' && (activeLesson.is_completed || activeLesson.quiz_passed) && (
                                    <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500', padding: '0.75rem 0' }}>
                                        <CheckCircle size={20} /> Completed
                                    </div>
                                )}
                                {user.role === 'instructor' && (
                                    <button onClick={handleGeneratePractice} disabled={generatingAI} className="btn" style={{ background: '#f3e8ff', color: '#9333ea', display: 'flex', gap: '0.5rem' }}>
                                        <Brain size={20} /> {generatingAI ? 'Generating...' : 'AI Generate Quiz Options'}
                                    </button>
                                )}
                                {activeLesson.has_quiz && user.role === 'student' && !activeLesson.quiz_passed && (
                                    <button onClick={handleTakeQuiz} className="btn" style={{ background: '#e0f2fe', color: '#0284c7', display: 'flex', gap: '0.5rem' }}>
                                        <Upload size={20} /> {quizData ? 'Retake Quiz' : 'Take Required Quiz'}
                                    </button>
                                )}
                            </div>

                            {/* AI Generated Questions Area (Instructor Only) */}
                            {aiQuestions && user.role === 'instructor' && (
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px dashed #cbd5e1' }}>
                                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 0, color: '#9333ea' }}><Brain size={20} /> AI Practice Area</h3>
                                    {aiQuestions.map((q, i) => (
                                        <div key={i} style={{ marginBottom: '1.5rem' }}>
                                            <p style={{ fontWeight: '600' }}>Q{i + 1}: {q.question}</p>
                                            <ul style={{ listStyle: 'none', padding: 0 }}>
                                                {q.options.map((opt, j) => (
                                                    <li key={j} style={{ padding: '0.5rem', background: 'white', border: '1px solid var(--border)', marginBottom: '0.5rem', borderRadius: '0.25rem' }}>{opt}</li>
                                                ))}
                                            </ul>
                                            <details>
                                                <summary style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: '500' }}>Show Answer</summary>
                                                <div style={{ marginTop: '0.5rem', padding: '1rem', background: '#dcfce7', borderRadius: '0.25rem' }}>
                                                    <strong>Answer:</strong> {q.answer}<br />
                                                    <em>{q.explanation}</em>
                                                </div>
                                            </details>
                                        </div>
                                    ))}
                                    <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                        <button onClick={handleSaveAIQuiz} className="btn btn-primary" style={{ flex: 1 }}>Save as Required Quiz</button>
                                        <button onClick={() => setAiQuestions(null)} className="btn" style={{ background: 'white', border: '1px solid var(--border)' }}>Close</button>
                                    </div>
                                </div>
                            )}

                            {/* Instructor Actions for Lesson */}
                            {user.role === 'instructor' && course.instructor_name === user.username && (
                                <div style={{ marginTop: '2rem', padding: '1rem', borderTop: '1px solid var(--border)' }}>
                                    <button onClick={() => setShowAddQuiz(!showAddQuiz)} className="btn" style={{ background: '#fef3c7', color: '#d97706' }}>
                                        {showAddQuiz ? 'Cancel Quiz Info' : (activeLesson.has_quiz ? 'Edit Action Quiz' : 'Add Quick Quiz')}
                                    </button>

                                    {showAddQuiz && (
                                        <form onSubmit={handleCreateQuiz} style={{ marginTop: '1rem', background: '#fffbeb', padding: '1rem', borderRadius: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            <h4>Create a 1-Question Quiz</h4>
                                            <input className="input" placeholder="Quiz Title" value={newQuizData.title} onChange={e => setNewQuizData({ ...newQuizData, title: e.target.value })} required />
                                            <input className="input" placeholder="Question Text" value={newQuizData.question} onChange={e => setNewQuizData({ ...newQuizData, question: e.target.value })} required />
                                            {newQuizData.options.map((opt, i) => (
                                                <input key={i} className="input" placeholder={`Option ${i + 1}`} value={opt} onChange={e => {
                                                    const newOpts = [...newQuizData.options];
                                                    newOpts[i] = e.target.value;
                                                    setNewQuizData({ ...newQuizData, options: newOpts });
                                                }} required />
                                            ))}
                                            <select className="input" value={newQuizData.correctIndex} onChange={e => setNewQuizData({ ...newQuizData, correctIndex: e.target.value })}>
                                                <option value={0}>Option 1 is correct</option>
                                                <option value={1}>Option 2 is correct</option>
                                                <option value={2}>Option 3 is correct</option>
                                                <option value={3}>Option 4 is correct</option>
                                            </select>
                                            <button type="submit" className="btn btn-primary">Save Quiz</button>
                                        </form>
                                    )}
                                </div>
                            )}

                            {/* Quiz Area */}
                            {quizData && user.role === 'student' && (
                                <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                                    <h3 style={{ marginTop: 0, color: '#0284c7' }}>Required Quiz: {quizData.title}</h3>
                                    {quizResult ? (
                                        <div style={{ padding: '2rem 1rem' }}>
                                            <h2 style={{ textAlign: 'center', color: quizResult.passed ? 'var(--success)' : 'var(--error)' }}>
                                                {quizResult.passed ? 'Congratulations! You Passed!' : 'You did not pass. Please review and try again.'}
                                            </h2>
                                            <p style={{ textAlign: 'center', fontSize: '1.2rem', marginBottom: '2rem' }}>Score: {quizResult.score} / {quizResult.total}</p>

                                            {/* Show Correct Answers */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                                                <h4 style={{ margin: 0, color: 'var(--text-main)' }}>Quiz Review:</h4>
                                                {quizResult.correct_answers?.map(ans => (
                                                    <div key={ans.question_id} style={{ background: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0' }}>
                                                        <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500' }}>Q: {ans.question_text}</p>
                                                        <p style={{ margin: 0, color: 'var(--success)' }}><CheckCircle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} /> Correct Answer: {ans.correct_choice_text}</p>
                                                    </div>
                                                ))}
                                            </div>

                                            <div style={{ textAlign: 'center' }}>
                                                <button onClick={() => { setQuizResult(null); setQuizAnswers({}); handleTakeQuiz(); }} className="btn">Retake Quiz</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div>
                                            {quizData.questions.map((q) => (
                                                <div key={q.id} style={{ marginBottom: '1.5rem' }}>
                                                    <p style={{ fontWeight: '600' }}>{q.text}</p>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        {q.choices.map((c) => (
                                                            <label key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', padding: '0.5rem', background: 'white', border: '1px solid var(--border)', borderRadius: '0.25rem' }}>
                                                                <input
                                                                    type="radio"
                                                                    name={`question_${q.id}`}
                                                                    onChange={() => setQuizAnswers({ ...quizAnswers, [q.id]: c.id })}
                                                                    checked={quizAnswers[q.id] === c.id}
                                                                /> {c.text}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))}
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <button onClick={handleSubmitQuiz} className="btn btn-primary" disabled={Object.keys(quizAnswers).length < quizData.questions.length}>Submit Quiz</button>
                                                <button onClick={() => setQuizData(null)} className="btn">Cancel</button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="card" style={{ textAlign: 'center', padding: '4rem 2rem', color: 'var(--text-muted)' }}>
                            <BookOpen size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                            <h2>Welcome to {course.title}</h2>
                            <p>Select a lesson from the sidebar to begin.</p>
                        </div>
                    )}
                </div>

                {/* Instructor Analytics Sidebar */}
                {user.role === 'instructor' && course.instructor_name === user.username && !showAddLesson && (
                    <div className="card scrollable-column" style={{ padding: '1.5rem' }}>
                        <h2 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem' }}>
                            <CheckCircle size={20} /> Class Progress
                        </h2>
                        {studentsProgress.length > 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                                {studentsProgress.map((sp, idx) => (
                                    <div key={idx} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
                                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>{sp.student_name}</div>
                                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem' }}>{sp.email}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ flex: 1, height: '6px', background: 'var(--border)', borderRadius: '3px', overflow: 'hidden' }}>
                                                <div style={{ height: '100%', background: 'var(--primary)', width: `${sp.progress}%` }}></div>
                                            </div>
                                            <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{sp.progress}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No students yet.</p>
                        )}
                    </div>
                )}
            </div>

            {/* Course Rating Modal Overlay */}
            {showRatingModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeIn 0.3s'
                }}>
                    <div className="card" style={{ maxWidth: '400px', width: '90%', textAlign: 'center', position: 'relative' }}>
                        <button onClick={() => setShowRatingModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                            <X size={20} />
                        </button>
                        <Star size={48} color="#fbbf24" style={{ margin: '1rem auto' }} />
                        <h2 style={{ marginTop: 0 }}>Rate This Course</h2>
                        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                            You just passed a lesson! How would you rate this course so far? Your feedback helps others.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <div
                                    key={star}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setSelectedRating(star)}
                                    style={{ cursor: 'pointer', padding: '0.2rem' }}
                                >
                                    <Star
                                        size={32}
                                        fill={(hoverRating || selectedRating) >= star ? "#fbbf24" : "transparent"}
                                        color={(hoverRating || selectedRating) >= star ? "#fbbf24" : "var(--border)"}
                                        style={{ transition: 'all 0.2s' }}
                                    />
                                </div>
                            ))}
                        </div>
                        <button onClick={handleRateCourse} className="btn btn-primary" style={{ width: '100%' }} disabled={selectedRating === 0}>
                            Submit Rating
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CourseView;
