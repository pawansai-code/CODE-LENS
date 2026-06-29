from sqlalchemy import Column, String, Integer, Text, create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set!")

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class CodeChunkModel(Base):
    __tablename__ = "code_chunks"

    id = Column(String(36), primary_key=True, index=True)
    repo_url = Column(Text, index=True, nullable=False)
    file_path = Column(Text, index=True, nullable=False)
    chunk_type = Column(String(50))
    name = Column(String(255))
    qualified_name = Column(Text)
    start_line = Column(Integer)
    end_line = Column(Integer)
    source_code = Column(Text, nullable=False)
    complexity_score = Column(Integer)
    token_count = Column(Integer)

# Auto-create tables if they don't exist
try:
    Base.metadata.create_all(bind=engine)
    print("[INFO] Database tables verified.")
except Exception as e:
    print(f"[WARNING] Database connection failed or table creation skipped: {e}")
