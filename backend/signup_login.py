from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db, database
from models import User
from schemas import UserCreate, UserOut, UserLogin
from auth import validate_password_strength
from passlib.context import CryptContext


# Initialize FastAPI app
app = FastAPI()


@app.get("/test-connection")
async def test_connection():
    try:
        await database.connect()
        await database.disconnect()
        return {"status": "Connection successful"}
    except Exception as e:
        return {"status": "Connection failed", "error": str(e)}


# handles password hashing configuration using passlib
pwd_context = CryptContext (schemes=["bcrypt"], deprecated="auto")
 



# Endpoint to create a new user (Signup)
@app.post("/signup", response_model=UserOut)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate password strength
    validate_password_strength(user.password)  # Validate password before hashing

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create a new user instance
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )
    
    # Add user to the database
    db.add(new_user)
    await db.commit()
    
    return new_user


# Endpoint for user login
@app.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Verify the password
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    return {"message": "Login successful"}


# Health-check endpoint
@app.get("/")
async def health_check():
    return {"message": "Welcome to the Plant Disease Detection App!"}


# To run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "signup_login:app", host="0.0.0.0", port=8001, reload=True
    )

# uvicorn signup_login:app --host 0.0.0.0 --port 8001 --reload # to run the application