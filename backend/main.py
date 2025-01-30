from fastapi import FastAPI, Request, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from PIL import Image
import io
import uvicorn
from ollama import AsyncClient
from pydantic import BaseModel
import asyncio
from typing import AsyncGenerator
import json
from routes.signup_login import router as signup_login_router

#loading models
PLANT_MODELS = {
    'potato': {
        'model': tf.keras.models.load_model('../model/potato.h5'),
        'class_names': ['Early blight', 'Late blight', 'Healthy']
    },
    'tomato': {
        'model' : tf.keras.models.load_model('../model/tomato.h5', custom_objects={'KerasLayer': hub.KerasLayer}),
        'class_names': ['Bacterial Spot', 'Early Blight', 'Healthy', 'Late Blight', 'Leaf Mold', 'Mosaic Virus', 'Septoria Leaf spot', 'Target Spot', 'Two Spotted spider mites', 'Yellowleaf curl virus']
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
#include this line for login and sigup

app.include_router(signup_login_router, prefix="/auth")

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

async def generate_llm_response(plant: str, disease: str) -> AsyncGenerator[str, None]:
    async_client = AsyncClient()
    
    if disease == "Healthy":
        healthy_message = {
            "content": f"Your {plant} appears to be healthy! This is great news. Continue maintaining proper cultural practices like adequate watering, appropriate sunlight exposure, and good air circulation. Regular monitoring for any changes in plant health is always recommended as part of preventive care."
        }
        data = json.dumps({"content": healthy_message["content"]})
        yield f"data: {data}\n\n"
        yield "event: close\ndata: Stream completed\n\n"
        return

    message = {
        "role": "user",
        "content": f"As a plant pathologist, provide a concise explanation of {disease} in {plant}. Part 1 - Disease Overview: - What is the specific pathogen causing {disease}?- What are the primary symptoms of the disease?- How does the disease spread? Part 2 - Disease Management:- What are key prevention strategies?- What are effective treatment methods?- What cultural practices can minimize disease impact? Provide a technical, precise response focused on actionable information for farmers and agricultural professionals. Remove special syntaxes like **, avoid using tabs or complex formatting, use plain text with clear, simple structure.",
    }
    
    try:
        async for part in await async_client.chat(
            model="llama3.2", 
            messages=[message], 
            stream=True
        ):
            data = json.dumps({"content": part['message']['content']})
            yield f"data: {data}\n\n"
    except Exception as e:
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
    finally:
        yield "event: close\ndata: Stream completed\n\n"

@app.get("/chat")
async def chat_stream(request: Request, plant: str, disease: str):
    return StreamingResponse(
        generate_llm_response(plant, disease), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
    )

async def converse(question: str) -> AsyncGenerator[str, None]:
    async_client = AsyncClient()
    message = {
        "role": "user",
        "content": f"As a supportive agent, provide the answer to the question: {question} in short, concise and informative way.",
    }

    try:
        async for part in await async_client.chat(
            model="llama3.2",
            messages=[message],
            stream=True
        ):
            data = json.dumps({"content": part['message']['content']})
            yield f"data: {data}\n\n"
    except Exception as e:
        error_data = json.dumps({"error": str(e)})
        yield f"data: {error_data}\n\n"
    finally:
        yield "event: close\ndata: Stream completed\n\n"

@app.get("/converse")
async def talk(request: Request, question: str):
    return StreamingResponse(
        converse(question),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream"
        }
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

        try:
            #check if the image is a leaf or not. if not then cancel the operation
            leaf_model = tf.keras.models.load_model('../model/leaf_nonleaf.h5', custom_objects={'KerasLayer': hub.KerasLayer})
            class_names = np.array(['leaf', 'non_leaf'])
            
            #trial pre-processing for the leaf-non_leaf classifier
            dup_img = Image.open(io.BytesIO(contents))
            dup_img = dup_img.resize((224, 224))
            dup_img = dup_img.convert('RGB')
            dup_img_array = np.array(dup_img)
            dup_img_array = dup_img_array/255.0
            dup_img_array = np.expand_dims(dup_img_array, axis=0)

            leaf_or_not = leaf_model.predict(dup_img_array)
            predicted_id = tf.math.argmax(leaf_or_not, axis=-1)
            predicted_label_batch = class_names[predicted_id]
            print(predicted_label_batch)
            #the code updated till this
        except Exception as e:
            print("Couldn't test the model for leaf or not")
            print("Actual error ", str(e))

        if(predicted_label_batch == "leaf" and plant.lower() == "tomato"):
            try:
                tomato_model = PLANT_MODELS[plant.lower()]
                model = tomato_model['model']
                class_names = tomato_model['class_names']

                dup_img = Image.open(io.BytesIO(contents))
                dup_img = dup_img.resize((224, 224))
                dup_img = dup_img.convert('RGB')
                dup_img_array = np.array(dup_img)
                dup_img_array = dup_img_array/255.0
                dup_img_array = np.expand_dims(dup_img_array, axis=0)

                predictions = model.predict(dup_img_array)

                probabilities = tf.nn.softmax(predictions[0])
                predicted_class = class_names[tf.math.argmax(probabilities, axis=-1)]
                confidence = round(100*float(np.max(probabilities)), 2)

                return{
                    "plant": plant,
                    "predicted_class": predicted_class,
                    "confidence": confidence,
                }
            except Exception as e:
                print("Error in prediction.")
                print("Actual error ", str(e))
        
        if(predicted_label_batch == "leaf"):
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
        else:
            return {
                "predicted_class": "Please input the image of a leaf",
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