from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import uvicorn

PLANT_MODELS = {
    'potato': {
        'model': tf.keras.models.load_model('potato.h5'),
        'class_names': ['Potato early blight', 'Potato late blight', 'Healthy potato']
    },
    'tomato': {
        'model': tf.keras.models.load_model('tomato.h5'),
        'class_names': ['Tomato bacterial spot', 'Tomato early blight', 'Tomato late blight', 'Tomato leaf mold', 'Tomato septoria leaf spot', 
                            'Tomato two spotted spider mites', 'Tomato target spot', 'Tomato yellow leaf curl virus',
                            'Tomato mosaic virus', 'Healthy tomato']
    },
    'pepper': {
        'model': tf.keras.models.load_model('pepper.h5'),
        'class_names': ['Pepper bell bacterial spot', 'Healthy pepper bell']
    }
}

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def preprocess_image(file_bytes, target_size=(256, 256)):
    try:
        img = Image.open(io.BytesIO(file_bytes))
        
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        img = img.resize(target_size)
        
        img_array = np.array(img)
        img_array = img_array / 255.0
        img_array = np.expand_dims(img_array, axis=0)
        
        return img_array
    except Exception as e:
        print(f"Error while preprocessing image: {e}")
        return None

@app.get("/available-plants")
async def get_available_plants():
    return {"available_plants": list(PLANT_MODELS.keys())}

@app.post("/predict/{plant}")
async def predict(plant: str, file: UploadFile = File(...)):
    print('file-received')
    if plant.lower() not in PLANT_MODELS:
        raise HTTPException(
            status_code=400,
            detail=f"Disease prediction not available for {plant}. Available plants: {list(PLANT_MODELS.keys())}"
        )

    try:
        contents = await file.read()
        
        img_array = preprocess_image(contents)
        
        if img_array is None:
            raise HTTPException(status_code=400, detail="Error processing image")

        plant_model = PLANT_MODELS[plant.lower()]
        model = plant_model['model']
        class_names = plant_model['class_names']

        predictions = model.predict(img_array)

        predicted_class = class_names[np.argmax(predictions[0])]
        confidence = round(100 * np.max(predictions[0]), 2)

        return {
            "plant": plant,
            "predicted_class": predicted_class, 
            "confidence": confidence
        }
    
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health_check():
    return {"status": "working"}

if __name__ == "__main__":
    uvicorn.run("main:app",
    host="0.0.0.0",
    port=8000,
    reload=True
)