from fastapi import HTTPException

def validate_password_strength(password: str):
    """
    Validates the strength of the password based on certain policies:
    - At least 8 characters
    """
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")

    return True