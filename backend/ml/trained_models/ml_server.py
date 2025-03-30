from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import logging
import os
from pathlib import Path
import sys


log_dir = Path('logs')
log_dir.mkdir(exist_ok=True)

formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')

file_handler = logging.FileHandler(log_dir / 'ml_server.log')
file_handler.setLevel(logging.ERROR)
file_handler.setFormatter(formatter)

console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

root_logger = logging.getLogger()
root_logger.setLevel(logging.INFO)
root_logger.addHandler(file_handler)
root_logger.addHandler(console_handler)


models = {}


MODEL_DIR = Path('trained_models')

MODEL_FEATURES = {
    'diabetes': {
        'required': ['age', 'bmi', 'diabetesFamilyHistory', 'bloodSugar'],
        'mapping': {
            'age': 'age',
            'bmi': 'bmi',
            'diabetesFamilyHistory': 'diabetesFamilyHistory',
            'bloodSugar': 'bloodSugar'
        }
    },
    'heart_disease': {
        'required': ['age', 'sex', 'cholesterol', 'smoking', 'bloodPressureSystolic'],
        'mapping': {
            'age': 'age',
            'sex': 'sex',
            'cholesterol': 'cholesterol',
            'smoking': 'smoking',
            'bloodPressureSystolic': 'bloodPressureSystolic'
        }
    },
    'respiratory': {
        'required': ['age', 'bmi', 'smoking', 'environmentalExposure', 'coughingFrequency'],
        'mapping': {
            'age': 'age',
            'bmi': 'bmi',
            'smoking': 'smoking',
            'environmentalExposure': 'environmentalExposure',
            'coughingFrequency': 'coughingFrequency'
        }
    },
    'blood_pressure': {
        'required': ['age', 'bmi', 'cholesterol', 'bloodPressureSystolic'],
        'mapping': {
            'age': 'age',
            'bmi': 'bmi',
            'cholesterol': 'cholesterol',
            'bloodPressureSystolic': 'bloodPressureSystolic'
        }
    }
}

# Clinical thresholds for risk factors
RISK_THRESHOLDS = {
    'age': {'high': 60, 'moderate': 45},
    'bmi': {'high': 30, 'moderate': 25},
    'bloodSugar': {'high': 140, 'moderate': 100},
    'cholesterol': {'high': 240, 'moderate': 200},
    'bloodPressureSystolic': {'high': 140, 'moderate': 120},
    'bloodPressureDiastolic': {'high': 90, 'moderate': 80}
}

def load_models():
    """Load all models and store them in the models dictionary"""
    logging.info("Starting to load models...")
    print("Starting to load models...")
    
    model_files = {
        'diabetes': 'diabetes_model.pkl',
        'heart_disease': 'heart_disease_model.pkl',
        'respiratory': 'respiratory_disease_model.pkl',
        'blood_pressure': 'blood_pressure_model.pkl'
    }

    for model_name, file_name in model_files.items():
        try:
            model_path = MODEL_DIR / file_name
            if not model_path.exists():
                error_msg = f"Model file not found: {model_path}"
                logging.error(error_msg)
                print(f"ERROR: {error_msg}")
                continue

            models[model_name] = joblib.load(model_path)
            logging.info(f"Successfully loaded model: {model_name}")
            print(f"Successfully loaded model: {model_name}")

        except Exception as e:
            error_msg = f"Error loading model {model_name}: {str(e)}"
            logging.error(error_msg)
            print(f"ERROR: {error_msg}")
            continue

    if not models:
        raise RuntimeError("No models were successfully loaded")

    print(f"Available models: {list(models.keys())}")
    return models

def calculate_risk_score(prediction_prob, feature_values, model_name):
    """Calculate risk score on a scale of 1-100 based on probability and feature values"""
    if prediction_prob is None:
        return 50  # Default score if no probability available
    
    # Base score from probability (0-70 scale)
    base_score = prediction_prob[1] * 70
    
    # Risk factor weights for each model
    risk_weights = {
        'diabetes': {
            'bloodSugar': 15,
            'bmi': 10,
            'age': 5
        },
        'heart_disease': {
            'bloodPressureSystolic': 15,
            'cholesterol': 10,
            'age': 5
        },
        'respiratory': {
            'smoking': 15,
            'environmentalExposure': 10,
            'age': 5
        },
        'blood_pressure': {
            'bloodPressureSystolic': 20,
            'age': 5,
            'bmi': 5
        }
    }
    
    # Calculate additional risk based on feature values
    additional_risk = 0
    if model_name in risk_weights:
        weights = risk_weights[model_name]
        for feature, weight in weights.items():
            if feature in feature_values:
                value = feature_values[feature]
                
                # Handle categorical features
                if feature == 'smoking':
                    additional_risk += weight if value else 0
                elif feature == 'environmentalExposure':
                    exposure_risk = {'low': 0, 'medium': weight/2, 'high': weight}
                    additional_risk += exposure_risk.get(value, 0)
                # Handle numerical features using thresholds
                elif feature in RISK_THRESHOLDS:
                    thresholds = RISK_THRESHOLDS[feature]
                    if value >= thresholds['high']:
                        additional_risk += weight
                    elif value >= thresholds['moderate']:
                        additional_risk += weight/2
    
    # Combine base score and additional risk
    final_score = base_score + additional_risk
    
    # Ensure score is between 1 and 100
    return min(100, max(1, round(final_score)))

def transform_features(data, model_name):
    """Transform input features to match model requirements"""
    if model_name not in MODEL_FEATURES:
        raise ValueError(f"Unknown model: {model_name}")
    
    feature_map = MODEL_FEATURES[model_name]
    required_features = feature_map['required']
    mapping = feature_map['mapping']
    
    # Verify all required features are present
    missing = [f for f in required_features if mapping[f] not in data]
    if missing:
        raise ValueError(f"Missing required features for {model_name}: {missing}")
    
    # Transform features to model format
    transformed = []
    feature_values = {}  # Store original values for risk score calculation
    
    for feature in required_features:
        mapped_feature = mapping[feature]
        value = data[mapped_feature]
        
        # Store original value
        feature_values[mapped_feature] = value
        
        # Transform categorical variables with more robust mapping
        if mapped_feature == 'environmentalExposure':
            # Handle numeric, string, and other input types
            if isinstance(value, (int, float)):
                # If it's already a numeric value (0, 1, 2), use it directly
                value = int(value)
                if value not in [0, 1, 2]:
                    raise ValueError(f"Invalid environmental exposure numeric value: {value}")
            else:
                # For string inputs
                value = str(value).lower()
                exposure_map = {'low': 0, 'medium': 1, 'high': 2}
                if value not in exposure_map:
                    raise ValueError(f"Invalid environmental exposure string value: {value}")
                value = exposure_map[value]
        
        elif mapped_feature == 'coughingFrequency':
            # Similar flexible handling for coughing frequency
            if isinstance(value, (int, float)):
                value = int(value)
                if value not in [0, 1, 2]:
                    raise ValueError(f"Invalid coughing frequency numeric value: {value}")
            else:
                value = str(value).lower()
                frequency_map = {'rare': 0, 'occasional': 1, 'frequent': 2}
                if value not in frequency_map:
                    raise ValueError(f"Invalid coughing frequency string value: {value}")
                value = frequency_map[value]
        
        elif mapped_feature == 'smoking':
            # Handle boolean, numeric, and string inputs for smoking
            if isinstance(value, bool):
                value = 1 if value else 0
            elif isinstance(value, str):
                value = 1 if value.lower() in ['true', '1', 'yes'] else 0
            else:
                value = int(bool(value))
        
        transformed.append(float(value))
    
    return np.array(transformed).reshape(1, -1), feature_values

def validate_input_data(data):
    """Validate input data types and ranges"""
    validation_rules = {
        'age': {'type': int, 'min': 0, 'max': 120},
        'bmi': {'type': float, 'min': 10, 'max': 50},
        'bloodPressureSystolic': {'type': int, 'min': 70, 'max': 250},
        'bloodPressureDiastolic': {'type': int, 'min': 40, 'max': 150},
        'bloodSugar': {'type': int, 'min': 30, 'max': 500},
        'cholesterol': {'type': int, 'min': 100, 'max': 500}
    }
    
    errors = []
    for field, rules in validation_rules.items():
        if field in data:
            value = data[field]
            try:
                # Type checking
                if not isinstance(value, (int, float)):
                    errors.append(f"{field} must be a number")
                # Range checking
                elif value < rules['min'] or value > rules['max']:
                    errors.append(f"{field} must be between {rules['min']} and {rules['max']}")
            except Exception as e:
                errors.append(f"Invalid value for {field}: {str(e)}")
    
    return errors

def create_app():
    """Create and configure the Flask app"""
    app = Flask(__name__)
    CORS(app)
    
    try:
        load_models()
        if not models:
            raise RuntimeError("No models were loaded successfully")
    except Exception as e:
        logging.critical(f"Failed to load models: {str(e)}")
        print(f"CRITICAL ERROR: Failed to load models: {str(e)}")
        return None

    @app.route('/')
    def home():
        return jsonify({
            'status': 'running',
            'available_models': list(models.keys()),
            'model_features': MODEL_FEATURES
        })

    @app.route('/predict', methods=['POST'])
    def predict():
        try:
            data = request.get_json()
            if not data or not isinstance(data.get('features'), dict):
                return jsonify({'error': 'Invalid request format'}), 400

            features = data['features']
            
            # Validate input data
            validation_errors = validate_input_data(features)
            if validation_errors:
                return jsonify({'error': 'Validation errors', 'details': validation_errors}), 400

            predictions = {}

            for model_name, model in models.items():
                try:
                    model_features, feature_values = transform_features(features, model_name)
                    prediction = model.predict(model_features)
                    prediction_prob = None
                    
                    if hasattr(model, 'predict_proba'):
                        prediction_prob = model.predict_proba(model_features)[0].tolist()
                    
                    # Calculate risk score
                    risk_score = calculate_risk_score(prediction_prob, feature_values, model_name)
                    
                    predictions[model_name] = {
                        'risk_score': risk_score,
                        'probability': prediction_prob,
                        'features_used': MODEL_FEATURES[model_name]['required'],
                        'prediction': int(prediction[0])
                    }
                except Exception as e:
                    logging.error(f"Error predicting with {model_name}: {str(e)}")
                    predictions[model_name] = {
                        'error': str(e),
                        'features_required': MODEL_FEATURES[model_name]['required']
                    }

            return jsonify({
                'predictions': predictions,
                'features_received': features
            })

        except Exception as e:
            logging.exception("Prediction error")
            return jsonify({'error': str(e)}), 500

    return app

if __name__ == '__main__':
    try:
        print("Starting ML Server...")
        app = create_app()
        if app is None:
            print("Failed to create Flask app - exiting")
            exit(1)
        print("ML Server running on http://127.0.0.1:5000")
        app.run(debug=True, port=5000)
    except Exception as e:
        logging.critical(f"Failed to start server: {str(e)}")
        print(f"CRITICAL ERROR: Failed to start server: {str(e)}")
        exit(1)