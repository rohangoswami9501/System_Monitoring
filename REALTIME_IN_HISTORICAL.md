# Real-Time Updates in Historical Mode

## Problem
When switching to Historical mode, the chart would only show the static historical data from the database. New real-time data from the WebSocket was not being added to the chart.

## Solution
Modified the WebSocket message handler to continue appending new real-time data points to the chart even when in Historical mode.

## How It Works

### 1. **Real-Time Mode** (Default)
- Shows only the last 60 seconds of live data
- Old data points are automatically removed
- Chart continuously scrolls with new data

### 2. **Historical Mode** (New Behavior)
- Loads historical data from database (7, 15, or 30 days)
- **Continues to receive and append new real-time data**
- Chart shows: `[Historical Data] + [New Real-Time Data]`
- No data is removed - chart keeps growing

## Technical Implementation

### Using `useRef` for WebSocket Callback
The WebSocket callback is created once when the component mounts, so it doesn't have access to the latest `viewMode` state. We use a ref to solve this:

```javascript
const viewModeRef = useRef(viewMode);

// Update ref when viewMode changes
useEffect(() => {
    viewModeRef.current = viewMode;
}, [viewMode]);
```

### Updated WebSocket Handler
```javascript
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    setHistoricalData(prev => {
        const newDataPoint = {
            time: new Date(data.timestamp).toLocaleString(),
            CPU: data.cpu.percent,
            RAM: data.ram.percent,
            Disk: data.disk.percent
        };
        
        const newData = [...prev, newDataPoint];
        
        // Different behavior based on mode
        if (viewModeRef.current === 'realtime') {
            return newData.slice(-60); // Keep only last 60
        } else {
            return newData; // Keep all data
        }
    });
};
```

## User Experience

### Scenario 1: Real-Time Mode
1. User sees live data (last 60 seconds)
2. Chart updates every second
3. Old data scrolls off the left side

### Scenario 2: Historical Mode
1. User clicks "Historical" → "7 Days"
2. Chart loads 7 days of data from database
3. **New real-time data continues to appear on the right side**
4. Chart shows complete timeline: past 7 days + current moment

## Benefits

✅ **Continuous Monitoring**: Never miss current data even when reviewing history
✅ **Context**: See how current metrics compare to historical trends
✅ **Seamless**: No need to switch back to real-time mode to see latest data
✅ **Live Updates**: Chart title shows it's still receiving live data

## Example Timeline

```
Historical Mode (7 Days selected):

[Day 1] [Day 2] [Day 3] [Day 4] [Day 5] [Day 6] [Day 7] [NOW] [NOW+1s] [NOW+2s]...
|________________Historical Data________________| |____Live Updates____|
```

The chart seamlessly combines historical context with real-time monitoring!
