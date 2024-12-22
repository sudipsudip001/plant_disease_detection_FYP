from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker , declarative_base
from databases import Database
from dotenv import load_dotenv
import os


# Load environment variables from the .env file
load_dotenv()

# Access the environment variable
DATABASE_URL = os.getenv("DATABASE_URL")

# Initialize the database connection
database = Database(DATABASE_URL)

# Create the engine
engine = create_async_engine(DATABASE_URL, echo=True)

# Create the sessionmaker for async sessions
async_session = sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Base class for ORM models
Base = declarative_base()

# Dependency to get a database session
async def get_db():
    async with async_session() as session:
        yield session
