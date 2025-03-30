import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib
import numpy as np

# Load dataset
df = pd.read_csv('E:/HealthRiskAI/backend/ml/datasets/respiratory.csv') 

# Convert categorical columns into numerical values
# Ensure the exact mapping matches the client-side transformation
df['smoking'] = df['smoking_status'].map({'smoker': 1, 'non-smoker': 0})
df['environmentalExposure'] = df['environmentalExposure'].map({'low': 0, 'medium': 1, 'high': 2})
df['coughingFrequency'] = df['coughingFrequency'].map({'rare': 0, 'occasional': 1, 'frequent': 2})

# Print column names to verify
print("Columns:", df.columns.tolist())

# Define features and target variable
X = df[['age', 'bmi', 'smoking', 'environmentalExposure', 'coughingFrequency']]
y = df['target']

# Split the data into training and testing sets (80% training, 20% testing)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the model
model = RandomForestClassifier(n_estimators=100, random_state=42)

# Train the model
model.fit(X_train, y_train)

# Make predictions
y_pred = model.predict(X_test)

# Calculate accuracy
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy * 100:.2f}%')

# Feature importance
feature_importance = pd.DataFrame({
    'feature': X.columns,
    'importance': model.feature_importances_
}).sort_values('importance', ascending=False)
print("\nFeature Importance:")
print(feature_importance)

# Save the trained model
joblib.dump(model, 'E:/HealthRiskAI/backend/ml/trained_models/respiratory_disease_model.pkl')

# Optional: Validate feature names match exactly
print("\nFeature names in model:", list(X.columns))