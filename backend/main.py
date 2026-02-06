from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List
import uvicorn

from config import settings
from database import get_db, init_db, SystemMetric, ProcessMetric
from metrics_collector import collect_all_metrics
from pydantic import BaseModel

# Initialize FastAPI app
app = FastAPI(title="System Monitoring API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Pydantic models for API responses
class MetricsResponse(BaseModel):
    timestamp: str
    cpu: dict
    ram: dict
    disk: dict
    top_processes: List[dict]


class HistoricalMetricsResponse(BaseModel):
    id: int
    timestamp: datetime
    cpu_percent: float
    ram_percent: float
    ram_used_gb: float
    ram_total_gb: float
    disk_percent: float
    disk_used_gb: float
    disk_total_gb: float

    class Config:
        from_attributes = True


@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()
    print("Database initialized successfully")


@app.get("/")
def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "System Monitoring API",
        "version": "1.0.0"
    }


@app.get("/api/metrics/current", response_model=MetricsResponse)
def get_current_metrics(db: Session = Depends(get_db)):
    """
    Get current system metrics and store them in the database
    """
    # Collect metrics
    metrics = collect_all_metrics()
    
    # Store in database
    system_metric = SystemMetric(
        cpu_percent=metrics['cpu']['percent'],
        ram_percent=metrics['ram']['percent'],
        ram_used_gb=metrics['ram']['used_gb'],
        ram_total_gb=metrics['ram']['total_gb'],
        disk_percent=metrics['disk']['percent'],
        disk_used_gb=metrics['disk']['used_gb'],
        disk_total_gb=metrics['disk']['total_gb']
    )
    db.add(system_metric)
    
    # Store top processes
    for proc in metrics['top_processes']:
        process_metric = ProcessMetric(
            process_name=proc['name'],
            pid=proc['pid'],
            cpu_percent=proc['cpu_percent'],
            memory_mb=proc['memory_mb']
        )
        db.add(process_metric)
    
    db.commit()
    
    return metrics


@app.get("/api/metrics/history", response_model=List[HistoricalMetricsResponse])
def get_historical_metrics(
    minutes: int = 60,
    db: Session = Depends(get_db)
):
    """
    Get historical metrics for the last N minutes
    Default: last 60 minutes
    """
    cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
    
    metrics = db.query(SystemMetric)\
        .filter(SystemMetric.timestamp >= cutoff_time)\
        .order_by(SystemMetric.timestamp.desc())\
        .limit(1000)\
        .all()
    
    return metrics


@app.get("/api/processes/top")
def get_top_processes_history(
    minutes: int = 5,
    db: Session = Depends(get_db)
):
    """
    Get top processes from the last N minutes
    Default: last 5 minutes
    """
    cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
    
    processes = db.query(ProcessMetric)\
        .filter(ProcessMetric.timestamp >= cutoff_time)\
        .order_by(ProcessMetric.timestamp.desc())\
        .limit(100)\
        .all()
    
    return [
        {
            "id": p.id,
            "timestamp": p.timestamp.isoformat(),
            "process_name": p.process_name,
            "pid": p.pid,
            "cpu_percent": p.cpu_percent,
            "memory_mb": p.memory_mb
        }
        for p in processes
    ]


@app.delete("/api/metrics/cleanup")
def cleanup_old_metrics(days: int = 7, db: Session = Depends(get_db)):
    """
    Delete metrics older than N days
    Default: 7 days
    """
    cutoff_time = datetime.utcnow() - timedelta(days=days)
    
    deleted_metrics = db.query(SystemMetric)\
        .filter(SystemMetric.timestamp < cutoff_time)\
        .delete()
    
    deleted_processes = db.query(ProcessMetric)\
        .filter(ProcessMetric.timestamp < cutoff_time)\
        .delete()
    
    db.commit()
    
    return {
        "deleted_metrics": deleted_metrics,
        "deleted_processes": deleted_processes,
        "cutoff_date": cutoff_time.isoformat()
    }


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
