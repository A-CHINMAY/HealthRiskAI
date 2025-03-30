const axios = require('axios'); 

const getPrediction = async (formData) => {
    try {
        console.log("Received Form Data:", JSON.stringify(formData, null, 2));

        const requiredFields = [
            'age', 'sex', 'bmi', 'smoking', 'diabetesFamilyHistory',
            'bloodPressureSystolic', 'bloodPressureDiastolic',
            'bloodSugar', 'cholesterol', 'environmentalExposure',
            'coughingFrequency'
        ];

        const missingFields = requiredFields.filter(field =>
            formData[field] === undefined || formData[field] === null || formData[field] === ''
        );

        if (missingFields.length > 0) {
            console.error("Missing required fields:", missingFields);
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        const features = {
            age: Number(formData.age),
            sex: formData.sex === 'Male' ? 1 : (formData.sex === 'Female' ? 0 : 2),
            bmi: Number(formData.bmi),
            smoking: formData.smoking ? 1 : 0,
            diabetesFamilyHistory: formData.diabetesFamilyHistory ? 1 : 0,
            bloodPressureSystolic: Number(formData.bloodPressureSystolic),
            bloodPressureDiastolic: Number(formData.bloodPressureDiastolic),
            bloodSugar: Number(formData.bloodSugar),
            cholesterol: Number(formData.cholesterol),
            environmentalExposure: ['low', 'medium', 'high'].indexOf(formData.environmentalExposure), 
            coughingFrequency: ['rare', 'occasional', 'frequent'].indexOf(formData.coughingFrequency), 
        };

        console.log("Features sent to ML model:", JSON.stringify(features, null, 2));
        console.log("Form Data Received:", formData);
        console.log("Transformed Features Sent to Model:", features);


        Object.entries(features).forEach(([key, value]) => {
            if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
                console.error(`Invalid numeric value for ${key}:`, value);
                throw new Error(`Invalid numeric value for ${key}`);
            }
        });

        const response = await axios.post('http://127.0.0.1:5000/predict', { features }, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 5000
        });

        console.log("Raw API Response:", JSON.stringify(response.data, null, 2));

        if (!response.data || !response.data.predictions) {
            throw new Error('Invalid response format from server');
        }

        const summary = {};
        Object.entries(response.data.predictions).forEach(([disease, prediction]) => {
            console.log("Processing disease:", disease, "Prediction Data:", JSON.stringify(prediction, null, 2));

            if (!prediction.error) {
                const diseaseKey = disease.toLowerCase().replace(' ', '_');
                summary[disease] = {
                    riskScore: parseFloat(prediction.risk_score),
                    probability: prediction.probability ?
                        (prediction.probability[1] * 100).toFixed(2) + '%' : 'N/A',
                    lastUpdated: new Date(),
                    featuresUsed: prediction.features_used
                };
            } else {
                console.warn(`Skipping ${disease} due to error:`, prediction.error);
            }
        });

        console.log("Final Summary of Predictions:", JSON.stringify(summary, null, 2));

        return { summary };
    } catch (error) {
        console.error("Error in health prediction:", error);

        if (axios.isAxiosError(error)) {
            if (error.response) {
                console.error("Server responded with an error:", JSON.stringify(error.response.data, null, 2));
                throw new Error(`Server error: ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                console.error("No response from server - check if the ML server is running.");
                throw new Error('No response from server - please check if the ML server is running');
            } else {
                console.error("Error setting up request:", error.message);
                throw new Error(`Error setting up request: ${error.message}`);
            }
        }

        throw error;
    }
};

module.exports = { getPrediction };
