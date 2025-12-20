import React, { useEffect } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, loading } = useAuth();
    const isHome = location.pathname === '/';

    useEffect(() => {
        // Removed forced redirect to allow guest access
    }, [user, loading, location.pathname, navigate]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>Loading...</div>;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {/* Hide Navbar on profile setup page since they can't navigate yet */}
            {location.pathname !== '/profile-setup' && <Navbar />}
            <main className={isHome ? 'main-home' : ''} style={{ flex: 1 }}>
                {children}
            </main>
            {location.pathname !== '/profile-setup' && <Footer />}
        </div>
    );
};

export default Layout;
