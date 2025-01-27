from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User
from schemas import UserCreate, UserLogin
from auth import validate_password_strength
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from fastapi.responses import JSONResponse

router = APIRouter()

# Secret key for JWT encoding
SECRET_KEY = "abcd"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing configuration
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Function to create a JWT access token
def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Signup endpoint
@router.post("/signup")
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if the email is already registered
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate password strength
    validate_password_strength(user.password)

    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create a new user instance
    new_user = User(
        username=user.username,
        email=user.email,
        password=hashed_password
    )

    # Add the user to the database
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": new_user.email}, expires_delta=access_token_expires)

    # Return response with user info and token
    return {
        "message": "Signup successful",
        "user": {
            "username": new_user.username,
            "email": new_user.email
        },
        "access_token": access_token,
        "token_type": "Bearer"
    }

# Login endpoint
@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    # Check if the user exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Verify the password
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": existing_user.email}, expires_delta=access_token_expires)

    # Return response with user info and token
    return {
        "message": "Login successful",
        "user": {
            "username": existing_user.username,
            "email": existing_user.email
        },
        "access_token": access_token,
        "token_type": "Bearer"
    }

# Logout endpoint
@router.post("/logout")
async def logout():
    # Return a message indicating successful logout
    response = JSONResponse(content={"message": "Logout successful"})
    response.delete_cookie(key="access_token")  # Delete token from client-side cookies if set
    return response
