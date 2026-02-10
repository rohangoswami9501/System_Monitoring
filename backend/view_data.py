from database import SessionLocal, SystemMetric, ProcessMetric
from sqlalchemy import desc

def view_data():
    session = SessionLocal()
    try:
        print("--- Latest 5 System Metrics ---")
        metrics = session.query(SystemMetric).order_by(desc(SystemMetric.timestamp)).limit(5).all()
        for m in metrics:
            print(f"Time: {m.timestamp} | CPU: {m.cpu_percent}% | RAM: {m.ram_percent}% | Disk: {m.disk_percent}%")

        print("\n--- Latest 5 Process Entries ---")
        processes = session.query(ProcessMetric).order_by(desc(ProcessMetric.timestamp)).limit(5).all()
        for p in processes:
            print(f"Time: {p.timestamp} | PID: {p.pid} | Name: {p.process_name} | CPU: {p.cpu_percent}%")
            
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    view_data()
