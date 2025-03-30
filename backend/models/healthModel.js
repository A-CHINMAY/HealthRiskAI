const mongoose = require('mongoose');

const healthDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 0,
        max: 120
    },
    sex: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    bmi: {
        type: Number,
        required: true,
        min: 10,
        max: 50
    },
    // Vitals
    bloodPressureSystolic: {
        type: Number,
        required: true,
        min: 70,
        max: 250
    },
    bloodPressureDiastolic: {
        type: Number,
        required: true,
        min: 40,
        max: 150
    },
    bloodSugar: {
        type: Number,
        required: true,
        min: 30,
        max: 500
    },
    cholesterol: {
        type: Number,
        required: true,
        min: 100,
        max: 500
    },
    // Risk Factors
    smoking: {
        type: Boolean,
        required: true
    },
    diabetesFamilyHistory: {
        type: Boolean,
        required: true
    },
    environmentalExposure: {
        type: String,
        enum: ['low', 'medium', 'high'],
        required: true
    },
    coughingFrequency: {
        type: String,
        enum: ['rare', 'occasional', 'frequent'],
        required: true
    },
    // Risk Assessment Results
    riskAssessment: {
        bloodPressure: {
            riskScore: Number,
            probability: String,
            lastUpdated: Date,
            featuresUsed: [String]
        },
        diabetes: {
            riskScore: Number,
            probability: String,
            lastUpdated: Date,
            featuresUsed: [String]
        },
        heartDisease: {
            riskScore: Number,
            probability: String,
            lastUpdated: Date,
            featuresUsed: [String]
        },
        respiratory: {
            riskScore: Number,
            probability: String,
            lastUpdated: Date,
            featuresUsed: [String]
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
healthDataSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const HealthData = mongoose.model('HealthData', healthDataSchema);
module.exports = HealthData;