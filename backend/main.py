# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routes.signup_login import router as signup_login_router
from routes.prediction import router as prediction_router
from routes.chat import router as chat_router
import uvicorn

app = FastAPI()

# CORS and other global configurations
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include the routers
app.include_router(signup_login_router, prefix="/auth")
app.include_router(prediction_router, prefix="/prediction")
app.include_router(chat_router, prefix="/chat")


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"message": "An unexpected error occurred.", "details": str(exc)},
    )



@app.get("/")
async def health_check():
    return {
        "message": "Welcome to the Plant Disease Detection App!",
        "status": "healthy"
    }

# To run the application
if __name__ == "__main__":
    uvicorn.run("main:app",
    host="0.0.0.0",
    port=8000,
    reload=True
)