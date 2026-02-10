# Historical Data Toggle Feature

## Overview
Added a toggle button system that allows users to switch between real-time data and historical data views with configurable time ranges (7, 15, and 30 days).

## Features Added

### 1. View Mode Toggle
- **Real-Time Mode**: Shows live data from WebSocket (last 60 seconds)
- **Historical Mode**: Fetches and displays data from the database for selected time range

### 2. Time Range Selector
When in Historical mode, users can select:
- 7 Days
- 15 Days
- 30 Days

### 3. UI Components

#### Toggle Buttons
- Two main buttons: "📊 Real-Time" and "📈 Historical"
- Active state with blue gradient background
- Smooth hover effects and transitions

#### Time Range Buttons
- Three buttons for different time ranges
- Active state with green background
- Only visible when Historical mode is selected

#### Loading State
- Animated spinner while fetching historical data
- "Loading historical data..." message

## How It Works

### Frontend (App.jsx)

1. **State Management**:
   ```javascript
   const [viewMode, setViewMode] = useState('realtime'); // 'realtime' or 'historical'
   const [timeRange, setTimeRange] = useState(7); // days: 7, 15, or 30
   const [isLoadingHistory, setIsLoadingHistory] = useState(false);
   ```

2. **Data Fetching**:
   - When switching to Historical mode, `fetchHistoricalData()` is called
   - Converts days to minutes (e.g., 7 days = 10,080 minutes)
   - Calls the existing `/api/metrics/history` endpoint
   - Transforms data for chart display

3. **Event Handlers**:
   - `handleViewModeChange(mode)`: Switches between real-time and historical
   - `handleTimeRangeChange(days)`: Updates the time range selection

### Backend (main.py)

The existing `/api/metrics/history` endpoint already supports this feature:
```python
@app.get("/api/metrics/history")
def get_historical_metrics(minutes: int = 60, db: Session = Depends(get_db)):
    cutoff_time = datetime.utcnow() - timedelta(minutes=minutes)
    metrics = db.query(SystemMetric)...
```

## Styling

### Chart Controls Container
- Card-style background with border
- Flexbox layout for responsive design
- 20px padding with rounded corners

### Toggle Buttons
- Blue gradient when active
- Hover effects with slight lift animation
- Icon + text layout

### Range Buttons
- Green accent color when active
- Smaller size than toggle buttons
- Smooth transitions

### Loading State
- Centered spinner animation
- Clean, minimal design
- Matches overall theme

## User Experience

1. **Default State**: Opens in Real-Time mode showing last 60 seconds
2. **Switch to Historical**: Click "📈 Historical" button
3. **Select Time Range**: Choose 7, 15, or 30 days
4. **Loading**: Spinner appears while fetching data
5. **View Data**: Chart updates with historical data
6. **Switch Back**: Click "📊 Real-Time" to return to live view

## Responsive Design

- Mobile-friendly button sizes
- Buttons wrap on smaller screens
- Reduced padding on mobile devices
- Touch-friendly tap targets

## Technical Notes

- Uses existing API endpoint (no backend changes needed)
- Data is transformed from database format to chart format
- Chart title updates dynamically based on mode and range
- Historical data is cleared when switching back to real-time
- WebSocket continues running in background (doesn't disconnect)

## Future Enhancements

Possible improvements:
- Add date range picker for custom ranges
- Export historical data to CSV
- Add more granular time ranges (1 day, 3 days, etc.)
- Cache historical data to reduce API calls
- Add data aggregation for longer time periods
