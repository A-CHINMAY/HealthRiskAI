const HealthRecord = require('../models/healthModel');
const { getPrediction } = require('../ml/mlClient');

module.exports = {
    submitHealthData : async (req, res) => {
        console.log("Request received:", req.body);
        const userId = req.user.id;

        try {
            const healthData = {
                age: req.body.age,
                sex: req.body.sex,
                bmi: req.body.bmi,
                smoking: req.body.smoking,
                diabetesFamilyHistory: req.body.diabetesFamilyHistory,
                bloodPressureSystolic: req.body.bloodPressureSystolic,
                bloodPressureDiastolic: req.body.bloodPressureDiastolic,
                bloodSugar: req.body.bloodSugar,
                cholesterol: req.body.cholesterol,
                environmentalExposure: req.body.environmentalExposure,
                coughingFrequency: req.body.coughingFrequency
            };

            const prediction = await getPrediction(healthData);

            const formattedPrediction = {};
            Object.entries(prediction.summary).forEach(([disease, data]) => {
                formattedPrediction[disease] = {
                    riskScore: parseFloat(data.riskScore),
                    probability: data.probability,
                    lastUpdated: new Date(),
                    featuresUsed: data.featuresUsed
                };
            });

            const newHealthRecord = new HealthRecord({
                userId,
                ...healthData,
                riskAssessment: formattedPrediction,
                createdAt: new Date()
            });

            await newHealthRecord.save();

            res.status(201).json({
                message: 'Health record submitted successfully',
                prediction: formattedPrediction,
                record: newHealthRecord
            });
        } catch (error) {
            console.error("Error processing health data:", error);
            res.status(500).json({
                message: 'Error processing health data',
                error: error.message
            });
        }
    },

    getUserHealthRecords: async (req, res) => {
        try {
            const userId = req.user.id;
            const records = await HealthRecord.find({ userId })
                .sort({ createdAt: -1 })
                .select('-__v');

            res.status(200).json({ records });
        } catch (error) {
            console.error("Error fetching health records:", error);
            res.status(500).json({ message: 'Error fetching health records' });
        }
    }
};