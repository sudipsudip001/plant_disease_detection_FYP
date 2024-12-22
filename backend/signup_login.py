from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel, EmailStr 
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from database import get_db, database
from models import User
import uvicorn
from passlib.context import CryptContext


app = FastAPI()


@app.get("/test-connection")
async def test_connection():
    try:
        await database.connect()
        await database.disconnect()
        return {"status": "Connection successful"}
    except Exception as e:
        return {"status": "Connection failed", "error": str(e)}


# Set up Passlib context for bcrypt
pwd_context = CryptContext (schemes=["bcrypt"], deprecated="auto")
 

# Pydantic models for request data validation
class UserSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# Endpoint for Signup
@app.post("/signup")
async def signup(user: UserSignup, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    
    # Hash the password
    hashed_password = pwd_context.hash(user.password)

    # Create and add new user to the database
    new_user = User(
                    username=user.username, 
                    email=user.email, 
                    password=hashed_password
                    )

    db.add(new_user)
    await db.commit()

    return {"message": "User created successfully"}
    

# Endpoint for Login
@app.post("/login")
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalars().first()
    if not existing_user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify the password against the hashed password stored in the database
    if not pwd_context.verify(user.password, existing_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")


    return {"message": "Login successful"}


# Endpoint to list all usernames
@app.get("/users")
async def list_usernames(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User))
    users = result.scalars().all()
    usernames = [user.username for user in users]
    return {"usernames": usernames}



#HEalth-Check
@app.get("/")
async def health_check():
    return {"Welcome to plant app"}


#to run the file
if __name__ == "__main__":
    uvicorn.run("signup_login:app",
    host="0.0.0.0",
    port=8001,
    reload=True
)
# uvicorn signup_login:app --host 0.0.0.0 --port 8001 --reload # to run the application