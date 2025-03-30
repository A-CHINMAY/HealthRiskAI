import React from 'react';
import { useLocation } from 'react-router-dom';
import './RiskAssessment.css';

const RiskAssessment = () => {
    const location = useLocation();
    const { assessmentData } = location.state || {};

    console.log("RiskAssessment Data:", assessmentData);


    if (!assessmentData || !assessmentData.riskAssessment) {
        return (
            <div className="risk-assessment">
                <p>No assessment data available.</p>
            </div>
        );
    }

    console.log("Complete Risk Assessment Data:", assessmentData.riskAssessment);


    Object.entries(assessmentData.riskAssessment).forEach(([key, value]) => console.log("Risk Key:", key));

    const getRiskColor = (score) => {
        if (score < 50) return '#2ecc71';
        if (score < 80) return '#f1c40f';
        return '#e74c3c';
    };

    const getRecommendations = (type, score) => {
        const recommendations = {
            blood_pressure: [ 
                score > 80 && "Consult a healthcare provider immediately",
                score > 50 && "Monitor blood pressure regularly",
                "Maintain a healthy diet low in sodium",
                "Exercise regularly",
                "Reduce stress through meditation or yoga"
            ],
            diabetes: [
                score > 80 && "Schedule an appointment with an endocrinologist",
                score > 50 && "Monitor blood sugar levels regularly",
                "Maintain a balanced diet",
                "Exercise for at least 30 minutes daily",
                "Limit intake of refined sugars"
            ],
            heart_disease: [ 
                score > 80 && "Seek immediate cardiac evaluation",
                score > 50 && "Schedule a cardiac checkup",
                "Follow a heart-healthy diet",
                "Maintain regular physical activity",
                "Quit smoking if applicable"
            ],
            respiratory: [
                score > 80 && "Consult a pulmonologist",
                score > 50 && "Monitor breathing patterns",
                "Avoid exposure to pollutants",
                "Practice breathing exercises",
                "Maintain good indoor air quality"
            ],
        };

        return recommendations[type] ? recommendations[type].filter(Boolean) : [];
    };

    const calculateAngle = (score) => {
        return (score / 100) * 360;
    };

    return (
        <div className="risk-assessment">
            <h2>Your Health Risk Assessment Results</h2>

            <div className="risk-cards">
                {Object.entries(assessmentData.riskAssessment).map(([type, data]) => {
                    const angle = calculateAngle(data?.riskScore);
                    const riskColor = getRiskColor(data?.riskScore);

                    return (
                        <div key={type} className="risk-card">
                            <h3>{type.replace(/_/g, ' ')}</h3>

                            <div className="risk-indicator">
                                {data?.riskScore !== undefined && (
                                    <div
                                        className="risk-gauge"
                                        style={{
                                            background: `conic-gradient(${riskColor} ${angle}deg, #ecf0f1 ${angle}deg)`
                                        }}
                                    >
                                        <div className="risk-percentage">{data.riskScore}%</div>
                                    </div>
                                )}
                                <p className="risk-level">
                                    Probability: {data?.probability || "N/A"}
                                </p>
                            </div>

                            <div className="recommendations">
                                <h4>Recommendations</h4>
                                <ul>
                                    {getRecommendations(type, data?.riskScore).map((rec, index) => (
                                        <li key={index}>{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default RiskAssessment;