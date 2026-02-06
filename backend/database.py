from sqlalchemy import create_engine, Column, Integer, Float, String, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
from config import settings

# Create database engine
engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class SystemMetric(Base):
    """Time-series table for system metrics"""
    __tablename__ = "system_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cpu_percent = Column(Float, nullable=False)
    ram_percent = Column(Float, nullable=False)
    ram_used_gb = Column(Float, nullable=False)
    ram_total_gb = Column(Float, nullable=False)
    disk_percent = Column(Float, nullable=False)
    disk_used_gb = Column(Float, nullable=False)
    disk_total_gb = Column(Float, nullable=False)


class ProcessMetric(Base):
    """Table for top CPU-consuming processes"""
    __tablename__ = "process_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    process_name = Column(String, nullable=False)
    pid = Column(Integer, nullable=False)
    cpu_percent = Column(Float, nullable=False)
    memory_mb = Column(Float, nullable=False)


def get_db():
    """Dependency for database sessions"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
