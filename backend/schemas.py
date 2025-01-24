from pydantic import BaseModel, EmailStr
from typing import Optional

# For user creation (Signup)
class UserBase(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserCreate(UserBase):
    pass

# Incase of returning user data (User details for production response)
class UserOut(BaseModel):
    id: int
    username: str
    email: EmailStr

    class Config:
        from_attributes = True

# For login (Email and password)
class UserLogin(BaseModel):
    email: EmailStr
    password: str
