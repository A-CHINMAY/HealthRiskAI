import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder
import joblib  # To save the model

# Load the dataset
df = pd.read_csv('E:/HealthRiskAI/backend/ml/datasets/diabetes.csv')

# Initialize LabelEncoder
label_encoder = LabelEncoder()

# Encode categorical columns (if any)
df['family_history'] = label_encoder.fit_transform(df['family_history'])

# Print the encoded dataset to check
print(df)

# Extract features and target
X = df.drop(columns='target')  # Features
y = df['target']  # Target variable

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Initialize the Random Forest model
model = RandomForestClassifier()

# Train the model
model.fit(X_train, y_train)

# Predict on the test set
y_pred = model.predict(X_test)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy * 100:.2f}%')

# Save the trained model as a .pkl file
joblib.dump(model, 'E:/HealthRiskAI/backend/ml/trained_models/diabetes_model.pkl')
