from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db, database
from models import User
from schemas import UserCreate, UserOut, UserLogin
from utils.auth import validate_password_strength
from passlib.context import CryptContext

# Initialize the router
router = APIRouter()

# Password hashing setup using passlib
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


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

    return new_user


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

    return {"message": "Login successful"}
