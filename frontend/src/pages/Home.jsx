import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, TrendingUp, Bot, LayoutDashboard, CheckCircle2, ArrowRight, Sparkles, Users, Award, Play } from 'lucide-react';
import { getCourses } from '../services/apiService';
import './Home.css';

// Custom 3D Book Component
const AnimatedBook = () => {
    return (
        <div className="book-container">
            <div className="book">
                <div className="book-cover">
                    <div className="book-spine"></div>
                    <div className="book-front">
                        <div className="book-title">
                            <Sparkles size={24} />
                            <span>Learn</span>
                        </div>
                        <div className="book-decoration">
                            <div className="book-line"></div>
                            <div className="book-line"></div>
                            <div className="book-line"></div>
                        </div>
                    </div>
                    <div className="book-pages">
                        <div className="page"></div>
                        <div className="page"></div>
                        <div className="page"></div>
                        <div className="page"></div>
                        <div className="page"></div>
                    </div>
                    <div className="book-back"></div>
                </div>
            </div>
            {/* Floating elements around the book */}
            <div className="floating-elements">
                <div className="floating-element element-1">
                    <Award size={20} />
                </div>
                <div className="floating-element element-2">
                    <Play size={16} />
                </div>
                <div className="floating-element element-3">
                    <Users size={18} />
                </div>
                <div className="floating-element element-4">📚</div>
                <div className="floating-element element-5">✨</div>
                <div className="floating-element element-6">🎯</div>
            </div>
            {/* Glowing orbs */}
            <div className="glow-orb orb-1"></div>
            <div className="glow-orb orb-2"></div>
            <div className="glow-orb orb-3"></div>
        </div>
    );
};

// Intersection Observer Hook for scroll animations
const useIntersectionObserver = (options = {}) => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsVisible(true);
                observer.unobserve(entry.target);
            }
        }, { threshold: 0.1, ...options });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, []);

    return [ref, isVisible];
};

// Animated Counter Component
const AnimatedCounter = ({ end, duration = 2000, suffix = '' }) => {
    const [count, setCount] = useState(0);
    const [ref, isVisible] = useIntersectionObserver();

    useEffect(() => {
        if (!isVisible) return;
        
        let startTime;
        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            setCount(Math.floor(progress * end));
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    }, [isVisible, end, duration]);

    return <span ref={ref}>{count}{suffix}</span>;
};

const Home = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    // Section refs for scroll animations
    const [featuresRef, featuresVisible] = useIntersectionObserver();
    const [stepsRef, stepsVisible] = useIntersectionObserver();
    const [coursesRef, coursesVisible] = useIntersectionObserver();
    const [rolesRef, rolesVisible] = useIntersectionObserver();
    const [ctaRef, ctaVisible] = useIntersectionObserver();

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await getCourses();
                setCourses(Array.isArray(data) ? data.slice(0, 3) : []);
            } catch (err) {
                console.error("Failed to fetch courses for preview", err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    // Parallax mouse effect
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth - 0.5) * 20,
                y: (e.clientY / window.innerHeight - 0.5) * 20
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="home-container">
            {/* Animated Background */}
            <div className="animated-background">
                <div className="bg-gradient-1"></div>
                <div className="bg-gradient-2"></div>
                <div className="bg-grid"></div>
                <div className="floating-shapes">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`shape shape-${i + 1}`}></div>
                    ))}
                </div>
            </div>

            {/* 1. Hero Section */}
            <section className="hero-section">
                <div className="hero-content animate-slide-in-left">
                    <div className="hero-badge">
                        <Sparkles size={14} />
                        <span>AI-Powered Learning Platform</span>
                    </div>
                    <h1 className="hero-heading">
                        <span className="text-gradient">Transform</span> Your Learning Journey with{' '}
                        <span className="text-gradient-secondary">AI</span>
                    </h1>
                    <p className="hero-subheading">
                        Elevate your education with intelligent course generation, seamless progress tracking, 
                        and AI-powered quizzes designed to maximize learning retention.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/register" className="btn btn-primary btn-large btn-glow">
                            <span>Get Started Free</span>
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-secondary btn-large btn-glass">
                            <Play size={18} />
                            <span>Watch Demo</span>
                        </Link>
                    </div>
                    {/* Stats */}
                    <div className="hero-stats">
                        <div className="stat-item">
                            <span className="stat-number"><AnimatedCounter end={1000} suffix="+" /></span>
                            <span className="stat-label">Active Students</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number"><AnimatedCounter end={50} suffix="+" /></span>
                            <span className="stat-label">Courses</span>
                        </div>
                        <div className="stat-divider"></div>
                        <div className="stat-item">
                            <span className="stat-number"><AnimatedCounter end={95} suffix="%" /></span>
                            <span className="stat-label">Satisfaction</span>
                        </div>
                    </div>
                </div>
                <div 
                    className="hero-image animate-slide-in-right"
                    style={{
                        transform: `translate(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px)`
                    }}
                >
                    <AnimatedBook />
                </div>
            </section>

            {/* 2. Features Section */}
            <section 
                ref={featuresRef}
                className={`section features-section ${featuresVisible ? 'animate-visible' : ''}`}
            >
                <div className="section-header">
                    <span className="section-badge">Features</span>
                    <h2 className="section-title">Everything You Need to <span className="text-gradient">Succeed</span></h2>
                    <p className="section-subtitle">Powerful tools designed to enhance your learning experience</p>
                </div>
                <div className="features-grid">
                    {[
                        { icon: <BookOpen size={28} />, title: 'Course Management', desc: 'Create, organize, and manage comprehensive courses with structured lessons and materials.', delay: 0 },
                        { icon: <TrendingUp size={28} />, title: 'Progress Tracking', desc: 'Monitor student completion rates and course analytics in real-time with visual dashboards.', delay: 100 },
                        { icon: <Sparkles size={28} />, title: 'AI Generated Quizzes', desc: 'Automatically generate practice questions for any lesson using advanced AI capabilities.', delay: 200 },
                        { icon: <LayoutDashboard size={28} />, title: 'Intuitive Dashboards', desc: 'Dedicated, role-specific interfaces for both students and instructors to focus on what matters.', delay: 300 }
                    ].map((feature, index) => (
                        <div 
                            key={index} 
                            className="feature-card"
                            style={{ animationDelay: `${feature.delay}ms` }}
                        >
                            <div className="feature-icon-wrapper">
                                <div className="feature-icon">{feature.icon}</div>
                                <div className="feature-icon-bg"></div>
                            </div>
                            <h3>{feature.title}</h3>
                            <p>{feature.desc}</p>
                            <div className="feature-card-shine"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 3. How It Works Section */}
            <section 
                ref={stepsRef}
                className={`section steps-section ${stepsVisible ? 'animate-visible' : ''}`}
            >
                <div className="section-header">
                    <span className="section-badge">Process</span>
                    <h2 className="section-title">Start Learning in <span className="text-gradient">3 Simple Steps</span></h2>
                </div>
                <div className="steps-container">
                    <div className="steps-line"></div>
                    {[
                        { num: '01', title: 'Sign Up', desc: 'Create an account as a Student to learn or as an Instructor to teach.', icon: <Users size={24} /> },
                        { num: '02', title: 'Enroll & Learn', desc: 'Browse available courses, enroll with one click, and dive into structured lesson content.', icon: <BookOpen size={24} /> },
                        { num: '03', title: 'Track & Test', desc: 'Complete lessons, monitor your progress, and validate your knowledge with AI Quizzes.', icon: <Award size={24} /> }
                    ].map((step, index) => (
                        <div 
                            key={index} 
                            className="step-card"
                            style={{ animationDelay: `${index * 150}ms` }}
                        >
                            <div className="step-icon">{step.icon}</div>
                            <div className="step-number">{step.num}</div>
                            <div className="step-content">
                                <h3>{step.title}</h3>
                                <p>{step.desc}</p>
                            </div>
                            <div className="step-connector"></div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 4. Courses Preview Section */}
            <section 
                ref={coursesRef}
                className={`section courses-preview ${coursesVisible ? 'animate-visible' : ''}`}
            >
                <div className="section-header">
                    <span className="section-badge">Explore</span>
                    <h2 className="section-title">Featured <span className="text-gradient">Courses</span></h2>
                    <p className="section-subtitle">Discover our most popular courses</p>
                </div>
                {loading ? (
                    <div className="courses-loading">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="course-skeleton">
                                <div className="skeleton-image"></div>
                                <div className="skeleton-content">
                                    <div className="skeleton-line"></div>
                                    <div className="skeleton-line short"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : courses.length > 0 ? (
                    <div className="courses-grid">
                        {courses.map((course, index) => (
                            <div 
                                key={course.id} 
                                className="course-card"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="course-card-image">
                                    <div className="course-card-gradient"></div>
                                    <BookOpen size={40} />
                                </div>
                                <div className="course-card-content">
                                    <div className="course-card-badge">Popular</div>
                                    <h3>{course.title}</h3>
                                    <p>{course.description}</p>
                                    <div className="course-card-meta">
                                        <span className="instructor">
                                            <Users size={14} />
                                            {course.instructor_name || 'Admin'}
                                        </span>
                                        <span className="rating">
                                            ★ {course.average_rating ? parseFloat(course.average_rating).toFixed(1) : 'New'}
                                        </span>
                                    </div>
                                </div>
                                <Link to={`/courses/${course.id}`} className="course-card-btn">
                                    <span>View Course</span>
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="no-courses">
                        <BookOpen size={48} />
                        <p>No courses available at the moment.</p>
                    </div>
                )}
                <div className="courses-cta">
                    <Link to="/register" className="btn btn-outline btn-large">
                        View All Courses
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </section>

            {/* 5. Role-Based Section */}
            <section 
                ref={rolesRef}
                className={`section roles-section ${rolesVisible ? 'animate-visible' : ''}`}
            >
                <div className="section-header">
                    <span className="section-badge">For Everyone</span>
                    <h2 className="section-title">Tailored <span className="text-gradient">For You</span></h2>
                </div>
                <div className="roles-container">
                    <div className="role-card role-student">
                        <div className="role-card-bg"></div>
                        <div className="role-card-content">
                            <div className="role-icon">🎓</div>
                            <h3>For Students</h3>
                            <p>Everything you need to succeed in your learning journey.</p>
                            <ul className="role-features">
                                {[
                                    'Access to all enrolled courses',
                                    'Real-time progress tracking',
                                    'AI quizzes for self-assessment',
                                    'Earn certificates upon completion'
                                ].map((item, i) => (
                                    <li key={i} style={{ animationDelay: `${i * 100}ms` }}>
                                        <CheckCircle2 size={18} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="role-btn">
                                Start Learning <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                    <div className="role-card role-instructor">
                        <div className="role-card-bg"></div>
                        <div className="role-card-content">
                            <div className="role-icon">👨‍🏫</div>
                            <h3>For Instructors</h3>
                            <p>Powerful tools to create and manage engaging content.</p>
                            <ul className="role-features">
                                {[
                                    'Intuitive course builder',
                                    'Student progress analytics',
                                    'Generate lesson questions with AI',
                                    'Manage enrollments seamlessly'
                                ].map((item, i) => (
                                    <li key={i} style={{ animationDelay: `${i * 100}ms` }}>
                                        <CheckCircle2 size={18} />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link to="/register" className="role-btn">
                                Start Teaching <ArrowRight size={16} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* 6. Testimonials Section (New) */}
            <section className="section testimonials-section">
                <div className="section-header">
                    <span className="section-badge">Testimonials</span>
                    <h2 className="section-title">What Our <span className="text-gradient">Users Say</span></h2>
                </div>
                <div className="testimonials-grid">
                    {[
                        { name: 'Sarah Johnson', role: 'Student', text: 'This platform transformed my learning experience. The AI quizzes are incredibly helpful!', avatar: '👩‍💻' },
                        { name: 'Michael Chen', role: 'Instructor', text: 'Creating courses has never been easier. My students love the interactive content.', avatar: '👨‍🏫' },
                        { name: 'Emily Davis', role: 'Student', text: 'The progress tracking keeps me motivated. I can see exactly how far I\'ve come.', avatar: '👩‍🎓' }
                    ].map((testimonial, index) => (
                        <div key={index} className="testimonial-card" style={{ animationDelay: `${index * 100}ms` }}>
                            <div className="testimonial-quote">"</div>
                            <p>{testimonial.text}</p>
                            <div className="testimonial-author">
                                <div className="author-avatar">{testimonial.avatar}</div>
                                <div className="author-info">
                                    <span className="author-name">{testimonial.name}</span>
                                    <span className="author-role">{testimonial.role}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* 7. Call To Action Section */}
            <section 
                ref={ctaRef}
                className={`cta-section ${ctaVisible ? 'animate-visible' : ''}`}
            >
                <div className="cta-background">
                    <div className="cta-orb cta-orb-1"></div>
                    <div className="cta-orb cta-orb-2"></div>
                </div>
                <div className="cta-content">
                    <h2>Ready to Start Your <span>Learning Journey?</span></h2>
                    <p>Join thousands of students and instructors on the most innovative learning platform available today.</p>
                    <div className="cta-buttons">
                        <Link to="/register" className="btn btn-white btn-large">
                            <span>Get Started Free</span>
                            <ArrowRight size={18} />
                        </Link>
                        <Link to="/login" className="btn btn-ghost btn-large">
                            Already have an account? Login
                        </Link>
                    </div>
                </div>
            </section>

            {/* 8. Footer */}
            <footer className="footer">
                <div className="footer-wave">
                    <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
                        <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                    </svg>
                </div>
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3>
                            <BookOpen size={24} />
                            <span>MiniLMS</span>
                        </h3>
                        <p>An AI-powered Learning Management System designed to make education accessible and engaging for everyone.</p>
                        <div className="social-links">
                            <a href="#" className="social-link">𝕏</a>
                            <a href="#" className="social-link">in</a>
                            <a href="#" className="social-link">📧</a>
                        </div>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Platform</h4>
                            <Link to="/">Home</Link>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </div>
                        <div className="footer-column">
                            <h4>Resources</h4>
                            <a href="#">About LMS</a>
                            <a href="#">Contact Support</a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer">GitHub</a>
                        </div>
                        <div className="footer-column">
                            <h4>Legal</h4>
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Cookie Policy</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} MiniLMS. All rights reserved. Made with ❤️</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;