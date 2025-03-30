import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '../ui/Alert.jsx';
import { api } from '../../utils/api';
import './HealthForm.css';

const HealthForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        age: '',
        sex: '',
        bmi: '',
        bloodPressureSystolic: '',
        bloodPressureDiastolic: '',
        bloodSugar: '',
        cholesterol: '',
        smoking: false,
        diabetesFamilyHistory: false,
        environmentalExposure: 'low',
        coughingFrequency: 'rare'
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({
            ...prev,
            [e.target.name]: value
        }));
        if (error) setError('');
    };

    const validateForm = () => {
        const requiredFields = {
            age: 'Age',
            sex: 'Sex',
            bmi: 'BMI',
            bloodPressureSystolic: 'Systolic Blood Pressure',
            bloodPressureDiastolic: 'Diastolic Blood Pressure',
            bloodSugar: 'Blood Sugar',
            cholesterol: 'Cholesterol'
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([key]) => !formData[key])
            .map(([_, label]) => label);

        if (missingFields.length > 0) {
            setError(`Please fill in the following fields: ${missingFields.join(', ')}`);
            return false;
        }

        const numericValidation = {
            age: { min: 0, max: 120, label: 'Age' },
            bmi: { min: 10, max: 50, label: 'BMI' },
            bloodPressureSystolic: { min: 70, max: 250, label: 'Systolic Blood Pressure' },
            bloodPressureDiastolic: { min: 40, max: 150, label: 'Diastolic Blood Pressure' },
            bloodSugar: { min: 30, max: 500, label: 'Blood Sugar' },
            cholesterol: { min: 100, max: 500, label: 'Cholesterol' }
        };

        for (const [field, rules] of Object.entries(numericValidation)) {
            const value = Number(formData[field]);
            if (value < rules.min || value > rules.max) {
                setError(`${rules.label} must be between ${rules.min} and ${rules.max}`);
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            if (!validateForm()) {
                setIsSubmitting(false);
                return;
            }

            const modelData = {
                ...formData,
                age: Number(formData.age),
                bmi: Number(formData.bmi),
                bloodPressureSystolic: Number(formData.bloodPressureSystolic),
                bloodPressureDiastolic: Number(formData.bloodPressureDiastolic),
                bloodSugar: Number(formData.bloodSugar),
                cholesterol: Number(formData.cholesterol)
            };

            const response = await api.submitHealthData(modelData);

            navigate('/risk-assessment', {
                state: {
                    assessmentData: {
                        riskAssessment: response.prediction
                    }
                }
            });
        } catch (error) {
            setError(error.message || 'An error occurred while submitting the form. Please try again.');
            console.error('Form submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="health-form-container">
            <h2 className="text-2xl font-bold mb-6">Health Assessment Form</h2>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <form onSubmit={handleSubmit} className="health-form">
                <div className="form-section">
                    <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="age">Age*</label>
                            <input
                                type="number"
                                id="age"
                                name="age"
                                value={formData.age}
                                onChange={handleChange}
                                min="0"
                                max="120"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sex">Sex*</label>
                            <select
                                id="sex"
                                name="sex"
                                value={formData.sex}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="">Select Sex</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="bmi">BMI*</label>
                            <input
                                type="number"
                                id="bmi"
                                name="bmi"
                                value={formData.bmi}
                                onChange={handleChange}
                                min="10"
                                max="50"
                                step="0.1"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="text-xl font-semibold mb-4">Vital Signs</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label htmlFor="bloodPressureSystolic">Blood Pressure (Systolic)*</label>
                            <input
                                type="number"
                                id="bloodPressureSystolic"
                                name="bloodPressureSystolic"
                                value={formData.bloodPressureSystolic}
                                onChange={handleChange}
                                min="70"
                                max="250"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bloodPressureDiastolic">Blood Pressure (Diastolic)*</label>
                            <input
                                type="number"
                                id="bloodPressureDiastolic"
                                name="bloodPressureDiastolic"
                                value={formData.bloodPressureDiastolic}
                                onChange={handleChange}
                                min="40"
                                max="150"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bloodSugar">Blood Sugar (mg/dL)*</label>
                            <input
                                type="number"
                                id="bloodSugar"
                                name="bloodSugar"
                                value={formData.bloodSugar}
                                onChange={handleChange}
                                min="30"
                                max="500"
                                required
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="cholesterol">Cholesterol (mg/dL)*</label>
                            <input
                                type="number"
                                id="cholesterol"
                                name="cholesterol"
                                value={formData.cholesterol}
                                onChange={handleChange}
                                min="100"
                                max="500"
                                required
                                className="form-input"
                            />
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h3 className="text-xl font-semibold mb-4">Risk Factors</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group checkbox-group">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="smoking"
                                    checked={formData.smoking}
                                    onChange={handleChange}
                                    className="form-checkbox"
                                />
                                <span>Do you smoke?</span>
                            </label>
                        </div>

                        <div className="form-group checkbox-group">
                            <label className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="diabetesFamilyHistory"
                                    checked={formData.diabetesFamilyHistory}
                                    onChange={handleChange}
                                    className="form-checkbox"
                                />
                                <span>Family history of diabetes?</span>
                            </label>
                        </div>

                        <div className="form-group">
                            <label htmlFor="environmentalExposure">Environmental Exposure</label>
                            <select
                                id="environmentalExposure"
                                name="environmentalExposure"
                                value={formData.environmentalExposure}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="coughingFrequency">Coughing Frequency</label>
                            <select
                                id="coughingFrequency"
                                name="coughingFrequency"
                                value={formData.coughingFrequency}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                <option value="rare">Rare</option>
                                <option value="occasional">Occasional</option>
                                <option value="frequent">Frequent</option>
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`submit-button ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isSubmitting ? 'Submitting...' : 'Submit Assessment'}
                </button>
            </form>
        </div>
    );
};

export default HealthForm;