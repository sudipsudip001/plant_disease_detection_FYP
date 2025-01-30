# Plant Disease Detection - Final Year Project

## Overview
This repository contains a mobile application for plant disease detection, developed as a Final Year Project for our Computer Science Degree. The system aims to make plant disease detection more accessible to farmers through mobile devices, helping reduce the 20-40% annual global crop waste through timely detection and treatment.

## Features
- Disease detection for Potato, Tomato, and Pepper plants
- Real-time disease classification using CNN models
- Interactive chat interface using LLAMA 3.2 3B model via Ollama
- ChatGPT-like continuous response using SSE (Server Sent Events)

## Tech Stack
- Frontend: React Native with Expo
- Backend: FastAPI
- Machine Learning: TensorFlow & TensorFlow Hub
- Chat Model: Ollama (LLAMA 3.2 3B)

## Project Structure
```
plant_disease_detection_FYP/
├── backend/
│   ├── main.py             # API endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/
│   └── components          # React Native components
└── model/
    ├── notebooks/          # Model training notebooks
    └── .h5 files           # Trained model files like potato.h5, tomato.h5, pepper.h5, leaf_nonleaf.h5
```

## Model Architecture
Our CNN architecture follows a VGG-like structure:
- Input Layer: Accepts 224x224x3 RGB images
- 6 Sequential Blocks, each containing:
  - Convolutional Layer (3x3 filter)
  - MaxPooling Layer (2x2)
- Flatten Layer
- Dense Output Layer (class-specific)

Current Model Accuracies:
- Pepper: 100% (Please don't judge, there were only two classes)
- Potato: 96.7%
- Tomato: 89.67%

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/sudipsudip001/plant_disease_detection_FYP.git
cd plant_disease_detection_FYP
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv  # Create virtual environment (optional but recommended)
source venv/bin/activate  # On Windows use: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
```

### 4. Configure IP Address
1. Get your IP address:
   - Windows: Open CMD and type `ipconfig`
   - macOS/Linux: Open terminal and type `ifconfig`
2. Update IP address in frontend files:
   - Navigate to `Upload.js` and `Consults.js`
   - Replace `192.168.1.67` with your IP address in the `var` variable

### 5. Ollama Setup
1. Download Ollama from [ollama.ai](https://ollama.ai)
2. Install and run the application
3. First-time setup will automatically download required models

### 6. Run the Application
```bash
npm start
```
Then press:
- `w` for web
- `a` for Android
- `i` for iOS

## Dataset Training
1. Download datasets:
   - [PlantVillage Dataset (Kaggle)](https://www.kaggle.com/datasets/arjuntejaswi/plant-village)
   - [COCO Dataset](https://cocodataset.org/#home)
2. Split data into train/test/validation sets
3. Run training notebooks in `model/notebooks/`

*Important note: It is advised to split the data manually or using a script into train, test and validation sets. Make sure you put the dataset within the notebook folder and change the paths accordingly in the notebook.*

## Troubleshooting
Common issues and solutions:

1. Backend Connection Error:
   - Verify IP address configuration
   - Check if backend server is running
   - Ensure ports are not blocked by firewall

2. Model Loading Error:
   - Verify model files are in correct location
   - Check Python environment has all dependencies

3. Ollama Connection Issues:
   - Ensure Ollama is running
   - Check network connectivity
   - Verify model is downloaded (i.e. LLAMA 3.2 3b)

## Future Improvements
- [ ] Offline mode support with cached models & FAQs
- [ ] Plant Care tracker with calendar-based reminders
- [ ] Authentication and global chat system
- [ ] Voice-to-text input for accessibility
- [ ] Affected area highlighting and improved prediction accuracy

## Demo
Watch our [application demonstration video](https://youtu.be/-vwPAobbybs)

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments
- [PlantVillage Dataset](https://github.com/spMohanty/PlantVillage-Dataset) for training data
- COCO team for the dataset
- TensorFlow team for transfer learning resources
- Ollama team for the chat model
