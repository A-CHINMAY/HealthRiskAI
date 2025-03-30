import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleClick = () => {
        if (token) {
            navigate('/health-form');
        } else {
            navigate('/login');
        }
    };

    return (
        <div className="home">
            <section className="hero">
                <div className="hero-content">
                    <h1>Take Control of Your Health</h1>
                    <p>Get personalized health risk assessments and recommendations based on your profile</p>
                    <button className="cta-button" onClick={handleClick}>
                        {token ? 'Start Assessment' : 'Login to Begin'}
                    </button>
                </div>
            </section>

            <section className="features">
                <h2>Our Features</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <h3>Comprehensive Analysis</h3>
                        <p>Get detailed insights about various health risk factors affecting your well-being</p>
                    </div>
                    <div className="feature-card">
                        <h3>Professional Recommendations</h3>
                        <p>Receive personalized health recommendations based on your assessment results</p>
                    </div>
                    <div className="feature-card">
                        <h3>Progress Tracking</h3>
                        <p>Monitor your health metrics over time and track your improvement</p>
                    </div>
                    <div className="feature-card">
                        <h3>Secure & Private</h3>
                        <p>Your health data is protected with industry-standard security measures</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
