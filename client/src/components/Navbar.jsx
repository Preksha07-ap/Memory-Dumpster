import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <div className="nav-cards">
                <Link to="/" className="nav-card">Home</Link>
                <Link to="/gallery" className="nav-card">Gallery</Link>
                <Link to="/events" className="nav-card">Events</Link>
                <Link to="/projects" className="nav-card">Projects</Link>
                <Link to="/members" className="nav-card">Members</Link>

                {user ? (
                    <div className="profile-icons-wrapper">
                        <span className="member-badge">Hello, {user.name || 'Member'}! 👋</span>
                        <div className="profile-icon-container" onClick={() => document.getElementById('profile-dropdown').classList.toggle('show')}>
                            <img
                                src={user.img || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random&size=128`}
                                alt="Profile"
                                className="profile-icon"
                            />
                            <div id="profile-dropdown" className="profile-dropdown">
                                <Link to="/profile-setup" className="dropdown-item">Edit Profile</Link>
                                <div className="dropdown-item logout" onClick={logout}>Logout</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <Link to="/profile-setup" className="cta-btn" style={{ marginLeft: '15px', padding: '8px 20px', fontSize: '0.9rem' }}>
                        Join Community 🚀
                    </Link>
                )}
            </div>

            {/* Mobile Menu Button */}
            <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
                {isOpen ? <X size={32} /> : <Menu size={32} />}
            </button>

            {/* Mobile Menu Overlay */}
            {isOpen && (
                <div className="mobile-menu-overlay">
                    <Link to="/" className="mobile-nav-link" onClick={closeMenu}>Home</Link>
                    <Link to="/gallery" className="mobile-nav-link" onClick={closeMenu}>Gallery</Link>
                    <Link to="/events" className="mobile-nav-link" onClick={closeMenu}>Events</Link>
                    <Link to="/projects" className="mobile-nav-link" onClick={closeMenu}>Projects</Link>
                    <Link to="/members" className="mobile-nav-link" onClick={closeMenu}>Members</Link>
                    {user ? (
                        <>
                            <div style={{ color: '#666' }}>Signed in as {user.name}</div>
                            <Link to="/profile-setup" className="mobile-nav-link" onClick={closeMenu}>Edit Profile</Link>
                            <button onClick={() => { logout(); closeMenu(); }} className="mobile-nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
                        </>
                    ) : (
                        <Link to="/profile-setup" className="cta-btn" onClick={closeMenu}>Join Community 🚀</Link>
                    )}
                </div>
            )}
        </>
    );
};

export default Navbar;
