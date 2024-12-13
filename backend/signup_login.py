from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
import uvicorn

app = FastAPI()

# In-memory user database
fake_users_db = {}

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
async def signup(user: UserSignup):
    # Check if email already exists
    if user.email in fake_users_db:
        raise HTTPException(status_code=400, detail="Email already registered")

    
    # Store the new user in the fake database
    fake_users_db[user.email] = {
        "username": user.username,
        "email": user.email,
        "password": user.password
    }
    
    return {"message": "User created successfully"}

# Endpoint for Login
@app.post("/login")
async def login(user: UserLogin):
    # Check if user exists
    if user.email not in fake_users_db:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    # Verify the password
    stored_password = fake_users_db[user.email]["password"]
    if user.password != stored_password:
            raise HTTPException(status_code=400, detail="Invalid credentials")
    
    return {"message": "Login successful"}


@app.get("/")
async def health_check():
    return {"Welcome to plant app"}

# Endpoint to list all usernames
@app.get("/users")
async def list_usernames():
    # Extract all usernames from the fake_users_db
    usernames = [user_data["username"] for user_data in fake_users_db.values()]
    return {"usernames": usernames}


#to run the file
if __name__ == "__main__":
    uvicorn.run("signup_login:app",
    host="0.0.0.0",
    port=8001,
    reload=True
)
# uvicorn signup_login:app --host 0.0.0.0 --port 8001 --reload # to run the application