import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import joblib

# Load dataset
df = pd.read_csv('E:/HealthRiskAI/backend/ml/datasets/heart_disease.csv')

# Convert categorical column 'smoking_status' into numerical values
df['smoking_status'] = df['smoking_status'].map({'smoker': 1, 'non-smoker': 0})

# Define features and target variable
X = df.drop(columns='target')
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

# Save the trained model
joblib.dump(model, 'E:/HealthRiskAI/backend/ml/trained_models/heart_disease_model.pkl')
