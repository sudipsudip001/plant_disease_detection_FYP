from fastapi import APIRouter, HTTPException, File, UploadFile
from plant_models import PLANT_MODELS
from utils.image_preprocessing import preprocess_image
import numpy as np
import tensorflow as tf
import tensorflow_hub as hub
from PIL import Image
import io

router = APIRouter()

@router.post("/predict/{plant}")
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
                # "plant": "None",
                "predicted_class": "Please input the image of a leaf",
                # "confidence": 100.0,
            }
    
    except Exception as e:
        print(f"Prediction Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
