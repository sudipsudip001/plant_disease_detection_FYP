import tensorflow as tf

# Dictionary to store plant models and their associated class names
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
