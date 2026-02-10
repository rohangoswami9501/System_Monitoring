from database import SessionLocal, SystemMetric
from sqlalchemy import func

def check_data_range():
    session = SessionLocal()
    try:
        # Get the oldest and newest timestamps
        oldest = session.query(func.min(SystemMetric.timestamp)).scalar()
        newest = session.query(func.max(SystemMetric.timestamp)).scalar()
        total_count = session.query(func.count(SystemMetric.id)).scalar()
        
        print("=" * 60)
        print("DATABASE STORAGE ANALYSIS")
        print("=" * 60)
        
        if oldest and newest:
            time_diff = newest - oldest
            days = time_diff.days
            hours = time_diff.seconds // 3600
            minutes = (time_diff.seconds % 3600) // 60
            
            print(f"\nOldest Record: {oldest}")
            print(f"Newest Record: {newest}")
            print(f"\nTotal Time Span: {days} days, {hours} hours, {minutes} minutes")
            print(f"Total Hours: {time_diff.total_seconds() / 3600:.2f}")
            print(f"\nTotal Records: {total_count:,}")
            
            if time_diff.total_seconds() > 0:
                print(f"Records per Hour: {total_count / (time_diff.total_seconds() / 3600):.2f}")
            
            print("=" * 60)
        else:
            print("\nNo data found in database")
            print("=" * 60)
            
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == "__main__":
    check_data_range()
