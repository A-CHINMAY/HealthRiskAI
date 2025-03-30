import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';


const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    }
});


axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


axiosInstance.interceptors.response.use(
    (response) => response.data, 
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                window.location.href = '/login';
            }
            throw new Error(error.response.data.message || 'An error occurred');
        }
        throw new Error('Network error');
    }
);

const api = {
    login: (credentials) => axiosInstance.post('/users/login', credentials),
    register: (userData) => axiosInstance.post('/users/register', userData),
    logout: () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
    },


    submitHealthData: async (healthData) => {
        const formattedData = {
            age: Number(healthData.age),
            sex: healthData.sex,
            bmi: Number(healthData.bmi),
            bloodPressureSystolic: Number(healthData.bloodPressureSystolic),
            bloodPressureDiastolic: Number(healthData.bloodPressureDiastolic),
            bloodSugar: Number(healthData.bloodSugar),
            cholesterol: Number(healthData.cholesterol),
            smoking: Boolean(healthData.smoking),
            diabetesFamilyHistory: Boolean(healthData.diabetesFamilyHistory),
            environmentalExposure: healthData.environmentalExposure,
            coughingFrequency: healthData.coughingFrequency
        };

        try {
            const response = await axiosInstance.post('/health/submit', formattedData);
            return response; 
        } catch (error) {
            throw error;
        }
    },
    
    getUserHealthRecords: () => axiosInstance.get('/health/records'),

    getPrediction: (data) => {
        return axiosInstance.post('/predict', data, {
            headers: {
                'Content-Type': 'application/json', 
            },
        });
    },
};

export { api };
