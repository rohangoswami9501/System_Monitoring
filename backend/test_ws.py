import asyncio
import websockets
import json

async def test_connection():
    uri = "ws://127.0.0.1:8000/ws/metrics"
    try:
        async with websockets.connect(uri) as websocket:
            print("Connected successfully!")
            while True:
                message = await websocket.recv()
                data = json.loads(message)
                print(f"Received metrics: CPU={data['cpu']['percent']}%")
                break # Just read one to confirm
    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    asyncio.run(test_connection())
