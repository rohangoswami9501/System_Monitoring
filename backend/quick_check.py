import sys
sys.path.insert(0, '.')

from database import SessionLocal, SystemMetric
from sqlalchemy import func

session = SessionLocal()

oldest = session.query(func.min(SystemMetric.timestamp)).scalar()
newest = session.query(func.max(SystemMetric.timestamp)).scalar()
count = session.query(func.count(SystemMetric.id)).scalar()

if oldest and newest:
    diff = newest - oldest
    print(f"Oldest: {oldest}")
    print(f"Newest: {newest}")
    print(f"Duration: {diff}")
    print(f"Total records: {count}")
else:
    print("No data")

session.close()
