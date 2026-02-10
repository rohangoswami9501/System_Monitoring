import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/ws/metrics"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Successfully connected to WebSocket server!")
            
            # Wait for first message
            message = await websocket.recv()
            data = json.loads(message)
            print(f"✅ Received metrics data:")
            print(f"   CPU: {data['cpu']['percent']}%")
            print(f"   RAM: {data['ram']['percent']}%")
            print("Test passed!")
            
    except Exception as e:
        print(f"❌ Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_websocket())
