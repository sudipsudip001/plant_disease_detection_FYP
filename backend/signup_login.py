from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db
from models import User
from schemas import UserCreate, UserOut, UserLogin
from auth import validate_password_strength
from passlib.context import CryptContext
from datetime import datetime, timedelta
import jwt
from fastapi.responses import JSONResponse
import logging

router = APIRouter()

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Secret key to encode the JWT token
SECRET_KEY = "abcd"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Password hashing configuration using passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# Endpoint to create a new user (Signup)
@router.post("/signup", response_model=UserOut)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
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

    # Add user to the database
    db.add(new_user)
    await db.commit()

    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": new_user.email}, expires_delta=access_token_expires
    )

    response = JSONResponse(content={"id": new_user.id, "username": new_user.username, "email": new_user.email ,"access_token":access_token})
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)

    return response

# Endpoint for user login
@router.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Verify the password
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    # Create JWT token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": existing_user.email}, expires_delta=access_token_expires
    )

    response = JSONResponse(content={"message": "Login successful", "access_token": access_token})
     logging.debug(f"Response content: {response}")
    response.set_cookie(key="access_token", value=f"Bearer {access_token}", httponly=True)

    return response