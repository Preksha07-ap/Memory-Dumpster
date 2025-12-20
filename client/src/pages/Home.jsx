import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <header className="hero">
                <div className="hero-text">
                    <h1>Welcome to Engineering Bakchodi</h1>
                    <Link to="/gallery" className="cta-btn">Explore Memories 🚀</Link>
                </div>

                <div className="content">
                    <h2>Hello Friends!</h2>
                    <p>This space is for all our cherished memories — photos, vlogs, and memorable events we experienced together.</p>
                </div>
            </header>


        </div>
    );
};

export default Home;
