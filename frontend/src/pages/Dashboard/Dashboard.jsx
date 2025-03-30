import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import "./Dashboard.css";

const Dashboard = () => {
    const [healthRecords, setHealthRecords] = useState([]);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchHealthRecords();
    }, []);

    const fetchHealthRecords = async () => {
        try {
            const response = await api.getUserHealthRecords();
            console.log("API Response:", response);

            const records = Array.isArray(response.records)
                ? response.records
                : [{ riskAssessment: response.riskAssessment }];

            const processedRecords = records.map(record => ({
                ...record,
                riskAssessment: {
                    bloodPressure: {
                        riskScore: record.riskAssessment?.bloodPressure?.riskScore ?? "N/A",
                        probability: record.riskAssessment?.bloodPressure?.probability ?? "N/A"
                    },
                    diabetes: {
                        riskScore: record.riskAssessment?.diabetes?.riskScore ?? "N/A",
                        probability: record.riskAssessment?.diabetes?.probability ?? "N/A"
                    },
                    heartDisease: {
                        riskScore: record.riskAssessment?.heartDisease?.riskScore ?? "N/A",
                        probability: record.riskAssessment?.heartDisease?.probability ?? "N/A"
                    },
                    respiratory: {
                        riskScore: record.riskAssessment?.respiratory?.riskScore ?? "N/A",
                        probability: record.riskAssessment?.respiratory?.probability ?? "N/A"
                    }
                }
            }));

            console.log("Processed Health Records:", processedRecords);
            setHealthRecords(processedRecords);
        } catch (err) {
            console.error("Error fetching data:", err);
            setError("Error fetching data.");
        } finally {
            setLoading(false);
        }
    };


    const formatRiskScore = (score) => {
        const numScore = Number(score);
        return !isNaN(numScore) && numScore !== 0 ? Math.round(numScore) : "N/A";
    };

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="dashboard">
            <h2>Your Health Records</h2>
            <div className="records-grid">
                {healthRecords.length > 0 ? (
                    healthRecords.map((record, index) => (
                        <div key={index} className="record-card">
                            <h3>Record {index + 1}</h3>
                            <div className="risk-scores">
                                {Object.entries(record.riskAssessment).map(([key, assessment]) => (
                                    <div key={key} className="risk-item">
                                        <span className="risk-label">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                        <span className="risk-value">{formatRiskScore(assessment?.riskScore)}</span>
                                    </div>
                                ))}
                            </div>
                            <button
                                className="view-details-btn"
                                onClick={() => navigate('/risk-assessment', {
                                    state: { assessmentData: { riskAssessment: record.riskAssessment } }
                                })}
                            >
                                View Details
                            </button>
                        </div>
                    ))
                ) : (
                    <p>No health records available.</p>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
