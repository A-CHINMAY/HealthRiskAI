import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <header className="header">
            <div className="header-content">
                <Link to="/" className="logo">Health Risk Assessment</Link>
                <nav className="nav-links">
                    <Link to="/">Home</Link>
                    {token ? (
                        <>
                            <Link to="/dashboard">Dashboard</Link>
                            <Link to="/health-form">New Assessment</Link>
                            <button onClick={handleLogout} className="logout-btn">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">Login</Link>
                            <Link to="/register">Register</Link>
                        </>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;