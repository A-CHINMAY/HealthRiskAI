import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { api } from '../../utils/api';
import './Login.css';

const schema = yup.object().shape({
    email: yup.string().email('Invalid email format').required('Email is required'),
    password: yup.string().required('Password is required'),
    rememberMe: yup.boolean()
});

const Login = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: yupResolver(schema)
    });

    const onSubmit = async (data) => {
        try {
            const response = await api.login({
                email: data.email,
                password: data.password
            });

            if (response.token) {
                if (data.rememberMe) {
                    localStorage.setItem('token', response.token);
                } else {
                    sessionStorage.setItem('token', response.token);
                }
                toast.success('Login successful!');
                navigate('/dashboard');
            } else {
                toast.error('Invalid credentials. Please try again.');
            }
        } catch (err) {
            toast.error(err.message || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            {...register('email')}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && (
                            <span className="error-message">{errors.email.message}</span>
                        )}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            {...register('password')}
                            className={errors.password ? 'error' : ''}
                        />
                        {errors.password && (
                            <span className="error-message">{errors.password.message}</span>
                        )}
                    </div>
                    <div className="form-group checkbox">
                        <label>
                            <input
                                type="checkbox"
                                {...register('rememberMe')}
                            />
                            Remember me
                        </label>
                    </div>
                    <div className="form-links">
                        <Link to="/forgot-password">Forgot Password?</Link>
                        <Link to="/register">Create Account</Link>
                    </div>
                    <button
                        type="submit"
                        className="button button-primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
