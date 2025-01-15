from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import numpy as np
import tensorflow as tf
from PIL import Image
import io
import uvicorn
from ollama import AsyncClient
from pydantic import BaseModel

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

#for LLM response
class chatValues(BaseModel):
    plant: str
    disease: str

async def generate_llm_response(plant: str, disease: str):
    async_client = AsyncClient()
    message = {
        "role": "user",
        "content": f"Explain {disease} in {plant} comprehensively..."  # Your detailed prompt
    }
    
    try:
        async for part in await async_client.chat(
            model="llama3.2", 
            messages=[message], 
            stream=True
        ):
            yield f"data: {part['message']['content']}\n\n"
    except Exception as e:
        yield f"data: Error: {str(e)}\n\n"

@app.post("/chat")
async def chat_stream(plantInfo: chatValues):
    return StreamingResponse(
        generate_llm_response(plantInfo.plant, plantInfo.disease), 
        media_type="text/event-stream"
    )

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

        #check if the image is a leaf or not. if not then cancel the operation
        leaf_model = tf.keras.models.load_model('../model/leaf_nonleaf.h5')
        class_names = np.array(['leaf', 'non_leaf'])
        leaf_or_not = leaf_model.predict(img_array)
        predicted_id = tf.math.argmax(leaf_or_not, axis=-1)
        predicted_label_batch = class_names[predicted_id]
        print(predicted_label_batch)
        #the code updated till this
        
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
            "confidence": confidence,
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