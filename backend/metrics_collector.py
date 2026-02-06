import psutil
from typing import List, Dict
from datetime import datetime


def get_cpu_usage() -> float:
    """Get current CPU usage percentage"""
    return psutil.cpu_percent(interval=0.1)


def get_ram_usage() -> Dict[str, float]:
    """Get RAM usage statistics"""
    memory = psutil.virtual_memory()
    return {
        "percent": memory.percent,
        "used_gb": memory.used / (1024 ** 3),
        "total_gb": memory.total / (1024 ** 3),
        "available_gb": memory.available / (1024 ** 3)
    }


def get_disk_usage() -> Dict[str, float]:
    """Get disk usage statistics for the main partition"""
    disk = psutil.disk_usage('/')
    return {
        "percent": disk.percent,
        "used_gb": disk.used / (1024 ** 3),
        "total_gb": disk.total / (1024 ** 3),
        "free_gb": disk.free / (1024 ** 3)
    }


def get_top_processes(limit: int = 10) -> List[Dict]:
    """Get top CPU-consuming processes"""
    processes = []
    
    for proc in psutil.process_iter(['pid', 'name', 'cpu_percent', 'memory_info']):
        try:
            proc_info = proc.info
            processes.append({
                "pid": proc_info['pid'],
                "name": proc_info['name'],
                "cpu_percent": proc_info['cpu_percent'] or 0.0,
                "memory_mb": proc_info['memory_info'].rss / (1024 ** 2) if proc_info['memory_info'] else 0.0
            })
        except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
            pass
    
    # Sort by CPU usage and return top N
    processes.sort(key=lambda x: x['cpu_percent'], reverse=True)
    return processes[:limit]


def collect_all_metrics() -> Dict:
    """Collect all system metrics in one call"""
    import time
    start = time.time()
    
    cpu = get_cpu_usage()
    ram = get_ram_usage()
    disk = get_disk_usage()
    processes = get_top_processes()
    
    duration = time.time() - start
    print(f"Metrics collection took: {duration:.4f}s")
    
    return {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "cpu": {
            "percent": cpu
        },
        "ram": ram,
        "disk": disk,
        "top_processes": processes
    }
