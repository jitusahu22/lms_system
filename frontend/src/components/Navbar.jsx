import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, User } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', color: 'white', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BookOpen /> MiniLMS
            </Link>
            <div>
                {user ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '500' }}><User size={18} /> {user.username} <span style={{ fontSize: '0.8em', background: 'rgba(255,255,255,0.2)', padding: '0.1rem 0.4rem', borderRadius: '1rem', textTransform: 'capitalize' }}>{user.role}</span></span>
                        <Link to="/dashboard" className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '2rem' }}>
                            Dashboard
                        </Link>
                        <button onClick={handleLogout} className="btn" style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', borderRadius: '2rem' }}>
                            <LogOut size={16} style={{ marginRight: '0.4rem' }} /> Logout
                        </button>
                    </div>
                ) : (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <Link to="/login" className="btn" style={{ color: 'white', fontWeight: '500' }}>Login</Link>
                        <Link to="/register" className="btn" style={{ background: 'white', color: '#4f46e5', borderRadius: '2rem', padding: '0.5rem 1.5rem' }}>Register</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;


// import React, { useContext, useState, useEffect } from 'react';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import { 
//     LogOut, 
//     BookOpen, 
//     User, 
//     Menu, 
//     X, 
//     Home,
//     GraduationCap,
//     Mail,
//     Info,
//     ChevronDown,
//     Settings,
//     LayoutDashboard,
//     Bell,
//     Sparkles
// } from 'lucide-react';
// import './Navbar.css';

// const Navbar = () => {
//     const { user, logout } = useContext(AuthContext);
//     const navigate = useNavigate();
//     const location = useLocation();
    
//     const [isScrolled, setIsScrolled] = useState(false);
//     const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//     const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
//     const [isResourcesDropdownOpen, setIsResourcesDropdownOpen] = useState(false);

//     // Handle scroll effect
//     useEffect(() => {
//         const handleScroll = () => {
//             setIsScrolled(window.scrollY > 20);
//         };
//         window.addEventListener('scroll', handleScroll);
//         return () => window.removeEventListener('scroll', handleScroll);
//     }, []);

//     // Close mobile menu on route change
//     useEffect(() => {
//         setIsMobileMenuOpen(false);
//         setIsProfileDropdownOpen(false);
//         setIsResourcesDropdownOpen(false);
//     }, [location]);

//     // Close dropdowns when clicking outside
//     useEffect(() => {
//         const handleClickOutside = (e) => {
//             if (!e.target.closest('.dropdown')) {
//                 setIsProfileDropdownOpen(false);
//                 setIsResourcesDropdownOpen(false);
//             }
//         };
//         document.addEventListener('click', handleClickOutside);
//         return () => document.removeEventListener('click', handleClickOutside);
//     }, []);

//     const handleLogout = () => {
//         logout();
//         navigate('/login');
//     };

//     const isActive = (path) => location.pathname === path;

//     const navLinks = [
//         { path: '/', label: 'Home', icon: <Home size={18} /> },
//         { path: '/courses', label: 'Courses', icon: <GraduationCap size={18} /> },
//     ];

//     const resourceLinks = [
//         { path: '/about', label: 'About Us', icon: <Info size={18} /> },
//         { path: '/contact', label: 'Contact', icon: <Mail size={18} /> },
//         { path: '/faq', label: 'FAQ', icon: <Sparkles size={18} /> },
//     ];

//     return (
//         <>
//             <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
//                 <div className="navbar-container">
//                     {/* Logo */}
//                     <Link to="/" className="navbar-logo">
//                         <div className="logo-icon">
//                             <BookOpen size={24} />
//                         </div>
//                         <span className="logo-text">
//                             Mini<span className="logo-highlight">LMS</span>
//                         </span>
//                     </Link>

//                     {/* Desktop Navigation */}
//                     <div className="navbar-center">
//                         <ul className="nav-links">
//                             {navLinks.map((link) => (
//                                 <li key={link.path}>
//                                     <Link 
//                                         to={link.path} 
//                                         className={`nav-link ${isActive(link.path) ? 'active' : ''}`}
//                                     >
//                                         {link.icon}
//                                         <span>{link.label}</span>
//                                         {isActive(link.path) && <div className="nav-link-indicator"></div>}
//                                     </Link>
//                                 </li>
//                             ))}
                            
//                             {/* Resources Dropdown */}
//                             <li className="dropdown">
//                                 <button 
//                                     className={`nav-link dropdown-trigger ${resourceLinks.some(l => isActive(l.path)) ? 'active' : ''}`}
//                                     onClick={(e) => {
//                                         e.stopPropagation();
//                                         setIsResourcesDropdownOpen(!isResourcesDropdownOpen);
//                                     }}
//                                 >
//                                     <Info size={18} />
//                                     <span>Resources</span>
//                                     <ChevronDown 
//                                         size={16} 
//                                         className={`dropdown-arrow ${isResourcesDropdownOpen ? 'rotate' : ''}`} 
//                                     />
//                                 </button>
//                                 <div className={`dropdown-menu ${isResourcesDropdownOpen ? 'show' : ''}`}>
//                                     <div className="dropdown-header">
//                                         <span>Resources & Help</span>
//                                     </div>
//                                     {resourceLinks.map((link) => (
//                                         <Link 
//                                             key={link.path}
//                                             to={link.path} 
//                                             className="dropdown-item"
//                                         >
//                                             <div className="dropdown-item-icon">{link.icon}</div>
//                                             <span>{link.label}</span>
//                                         </Link>
//                                     ))}
//                                 </div>
//                             </li>
//                         </ul>
//                     </div>

//                     {/* Right Section */}
//                     <div className="navbar-right">
//                         {user ? (
//                             <div className="user-section">
//                                 {/* Notifications */}
//                                 <button className="icon-btn notification-btn">
//                                     <Bell size={20} />
//                                     <span className="notification-badge">3</span>
//                                 </button>

//                                 {/* User Profile Dropdown */}
//                                 <div className="dropdown">
//                                     <button 
//                                         className="profile-trigger"
//                                         onClick={(e) => {
//                                             e.stopPropagation();
//                                             setIsProfileDropdownOpen(!isProfileDropdownOpen);
//                                         }}
//                                     >
//                                         <div className="user-avatar">
//                                             {user.username?.charAt(0).toUpperCase()}
//                                         </div>
//                                         <div className="user-info">
//                                             <span className="user-name">{user.username}</span>
//                                             <span className="user-role">{user.role}</span>
//                                         </div>
//                                         <ChevronDown 
//                                             size={16} 
//                                             className={`dropdown-arrow ${isProfileDropdownOpen ? 'rotate' : ''}`}
//                                         />
//                                     </button>
//                                     <div className={`dropdown-menu profile-dropdown ${isProfileDropdownOpen ? 'show' : ''}`}>
//                                         <div className="dropdown-profile-header">
//                                             <div className="dropdown-avatar">
//                                                 {user.username?.charAt(0).toUpperCase()}
//                                             </div>
//                                             <div>
//                                                 <div className="dropdown-username">{user.username}</div>
//                                                 <div className="dropdown-email">{user.email || 'user@example.com'}</div>
//                                             </div>
//                                         </div>
//                                         <div className="dropdown-divider"></div>
//                                         <Link to="/dashboard" className="dropdown-item">
//                                             <div className="dropdown-item-icon"><LayoutDashboard size={18} /></div>
//                                             <span>Dashboard</span>
//                                         </Link>
//                                         <Link to="/profile" className="dropdown-item">
//                                             <div className="dropdown-item-icon"><User size={18} /></div>
//                                             <span>My Profile</span>
//                                         </Link>
//                                         <Link to="/settings" className="dropdown-item">
//                                             <div className="dropdown-item-icon"><Settings size={18} /></div>
//                                             <span>Settings</span>
//                                         </Link>
//                                         <div className="dropdown-divider"></div>
//                                         <button onClick={handleLogout} className="dropdown-item logout-item">
//                                             <div className="dropdown-item-icon"><LogOut size={18} /></div>
//                                             <span>Logout</span>
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="auth-buttons">
//                                 <Link to="/login" className="btn btn-ghost">
//                                     Login
//                                 </Link>
//                                 <Link to="/register" className="btn btn-primary">
//                                     <Sparkles size={16} />
//                                     <span>Get Started</span>
//                                 </Link>
//                             </div>
//                         )}

//                         {/* Mobile Menu Toggle */}
//                         <button 
//                             className="mobile-menu-btn"
//                             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
//                             aria-label="Toggle menu"
//                         >
//                             {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
//                         </button>
//                     </div>
//                 </div>
//             </nav>

//             {/* Mobile Menu Overlay */}
//             <div 
//                 className={`mobile-overlay ${isMobileMenuOpen ? 'show' : ''}`}
//                 onClick={() => setIsMobileMenuOpen(false)}
//             ></div>

//             {/* Mobile Menu */}
//             <div className={`mobile-menu ${isMobileMenuOpen ? 'show' : ''}`}>
//                 <div className="mobile-menu-header">
//                     <Link to="/" className="navbar-logo" onClick={() => setIsMobileMenuOpen(false)}>
//                         <div className="logo-icon">
//                             <BookOpen size={24} />
//                         </div>
//                         <span className="logo-text">
//                             Mini<span className="logo-highlight">LMS</span>
//                         </span>
//                     </Link>
//                     <button 
//                         className="mobile-close-btn"
//                         onClick={() => setIsMobileMenuOpen(false)}
//                     >
//                         <X size={24} />
//                     </button>
//                 </div>

//                 {user && (
//                     <div className="mobile-user-section">
//                         <div className="mobile-user-avatar">
//                             {user.username?.charAt(0).toUpperCase()}
//                         </div>
//                         <div className="mobile-user-info">
//                             <span className="mobile-user-name">{user.username}</span>
//                             <span className="mobile-user-role">{user.role}</span>
//                         </div>
//                     </div>
//                 )}

//                 <div className="mobile-menu-content">
//                     <div className="mobile-nav-section">
//                         <span className="mobile-section-title">Navigation</span>
//                         {navLinks.map((link, index) => (
//                             <Link 
//                                 key={link.path}
//                                 to={link.path} 
//                                 className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
//                                 style={{ animationDelay: `${index * 50}ms` }}
//                             >
//                                 {link.icon}
//                                 <span>{link.label}</span>
//                             </Link>
//                         ))}
//                     </div>

//                     <div className="mobile-nav-section">
//                         <span className="mobile-section-title">Resources</span>
//                         {resourceLinks.map((link, index) => (
//                             <Link 
//                                 key={link.path}
//                                 to={link.path} 
//                                 className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}
//                                 style={{ animationDelay: `${(navLinks.length + index) * 50}ms` }}
//                             >
//                                 {link.icon}
//                                 <span>{link.label}</span>
//                             </Link>
//                         ))}
//                     </div>

//                     {user && (
//                         <div className="mobile-nav-section">
//                             <span className="mobile-section-title">Account</span>
//                             <Link to="/dashboard" className="mobile-nav-link">
//                                 <LayoutDashboard size={18} />
//                                 <span>Dashboard</span>
//                             </Link>
//                             <Link to="/profile" className="mobile-nav-link">
//                                 <User size={18} />
//                                 <span>My Profile</span>
//                             </Link>
//                             <Link to="/settings" className="mobile-nav-link">
//                                 <Settings size={18} />
//                                 <span>Settings</span>
//                             </Link>
//                         </div>
//                     )}
//                 </div>

//                 <div className="mobile-menu-footer">
//                     {user ? (
//                         <button onClick={handleLogout} className="btn btn-logout-mobile">
//                             <LogOut size={18} />
//                             <span>Logout</span>
//                         </button>
//                     ) : (
//                         <div className="mobile-auth-buttons">
//                             <Link to="/login" className="btn btn-outline-mobile">
//                                 Login
//                             </Link>
//                             <Link to="/register" className="btn btn-primary-mobile">
//                                 <Sparkles size={16} />
//                                 Get Started
//                             </Link>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Navbar;