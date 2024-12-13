from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import uvicorn
import ollama


#loading models
PLANT_MODELS = {
    'potato': {
        'model': tf.keras.models.load_model('../model/potato.h5'),
        'class_names': ['Early blight', 'Late blight', 'Healthy']
    },
    'tomato': {
        'model': tf.keras.models.load_model('../model/tomato.h5'),
        'class_names': ['Bacterial spot', 'Early blight', 'Late blight', 'Leaf mold', 'Septoria leaf spot', 
                            'Two spotted spider mites', 'Target spot', 'Yellow leaf curl virus',
                            'Mosaic virus', 'Healthy']
    },
    'pepper': {
        'model': tf.keras.models.load_model('../model/pepper.h5'),
        'class_names': ['Bacterial spot', 'Healthy']
    }
}

app = FastAPI()

#CORS to allow API access from any frontend domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

#image prepocessing to match the model
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

#api-endpoints
@app.get("/available-plants")
async def get_available_plants():
    return {"available_plants": list(PLANT_MODELS.keys())}

#this function uses LLM, namely LLAMA 3.2 in order to give response to the user as an expert.
def suggestions(plant, disease, confidence):
    return ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": f"As a plant pathologist, provide a concise explanation of early blight in potato plants. Part 1 - Disease Overview: - What is the specific pathogen causing early blight?- What are the primary symptoms of the disease?- How does the disease spread? Part 2 - Disease Management:- What are key prevention strategies?- What are effective treatment methods?- What cultural practices can minimize disease impact? Provide a technical, precise response focused on actionable information for farmers and agricultural professionals. Remove special syntaxes like **, avoid using tabs or complex formatting, use plain text with clear, simple structure.",
            }
        ]
    ).message.content

@app.post("/chat")
async def chat():
    response = ollama.chat(
        model="llama3.2",
        messages=[
            {
                "role": "user",
                "content": "Tell me an interesting fact about elephants",
            },
        ],
    )
    return response

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

        if(predicted_class == 'Healthy'):
            response = "The plant is healthy so there's no need for further action."
        else:
            response = suggestions(plant, predicted_class, confidence)
        return {
            "plant": plant,
            "predicted_class": predicted_class, 
            "confidence": confidence,
            "steps_ahead": response,
        }
    
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def health_check():
    return {"status": "working"}

#to run the file
if __name__ == "__main__":
    uvicorn.run("main:app",
    host="0.0.0.0",
    port=8000,
    reload=True
)

# uvicorn main:app --host 0.0.0.0 --port 8000 --reload # to run the application