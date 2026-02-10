import React, { useState, useEffect, useRef } from 'react';
import { metricsAPI } from './api';
import MetricCard from './components/MetricCard';
import Chart from './components/Chart';
import ProcessTable from './components/ProcessTable';
import './App.css';

function App() {
    const [currentMetrics, setCurrentMetrics] = useState(null);
    const [historicalData, setHistoricalData] = useState([]);
    const [processes, setProcesses] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [viewMode, setViewMode] = useState('realtime'); // 'realtime' or 'historical'
    const [timeRange, setTimeRange] = useState(7); // days: 7, 15, or 30
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const viewModeRef = useRef(viewMode); // Ref to track viewMode in WebSocket callback

    // Update ref when viewMode changes
    useEffect(() => {
        viewModeRef.current = viewMode;
    }, [viewMode]);

    // WebSocket connection for real-time metrics
    useEffect(() => {
        let ws;
        let reconnectTimeout;

        const connect = () => {
            // Use 127.0.0.1 instead of localhost to avoid IPv6 resolution issues
            ws = new WebSocket('ws://127.0.0.1:8000/ws/metrics');

            ws.onopen = () => {
                console.log('WebSocket connected');
                setIsConnected(true);
                setError(null);
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);

                // Update current metrics
                setCurrentMetrics(data);
                setLastUpdate(new Date());

                // Update historical data for charts
                setHistoricalData(prev => {
                    const newDataPoint = {
                        time: new Date(data.timestamp).toLocaleString(),
                        CPU: data.cpu.percent,
                        RAM: data.ram.percent,
                        Disk: data.disk.percent
                    };

                    const newData = [...prev, newDataPoint];

                    // In realtime mode, keep only last 60 seconds
                    // In historical mode, keep all data (historical + new real-time)
                    if (viewModeRef.current === 'realtime') {
                        return newData.slice(-60);
                    } else {
                        // In historical mode, just append the new data
                        return newData;
                    }
                });

                // Update processes
                if (data.top_processes) {
                    setProcesses(data.top_processes);
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setIsConnected(false);
                setError('WebSocket connection error');
            };

            ws.onclose = () => {
                console.log('WebSocket disconnected. Reconnecting in 3 seconds...');
                setIsConnected(false);
                // Attempt to reconnect after 3 seconds
                reconnectTimeout = setTimeout(connect, 3000);
            };
        };

        // Initial connection
        connect();

        // Cleanup on component unmount
        return () => {
            clearTimeout(reconnectTimeout);
            if (ws) {
                ws.close();
            }
        };
    }, []);

    // Fetch historical data when switching to historical view
    useEffect(() => {
        if (viewMode === 'historical') {
            fetchHistoricalData();
        }
    }, [viewMode, timeRange]);

    const fetchHistoricalData = async () => {
        setIsLoadingHistory(true);
        try {
            const minutes = timeRange * 24 * 60; // Convert days to minutes
            const data = await metricsAPI.getHistoricalMetrics(minutes);

            // Transform data for the chart
            const transformedData = data.map(item => ({
                time: new Date(item.timestamp).toLocaleString(),
                CPU: item.cpu_percent,
                RAM: item.ram_percent,
                Disk: item.disk_percent
            })).reverse(); // Reverse to show oldest to newest

            setHistoricalData(transformedData);
        } catch (err) {
            console.error('Error fetching historical data:', err);
            setError('Failed to load historical data');
        } finally {
            setIsLoadingHistory(false);
        }
    };

    const handleViewModeChange = (mode) => {
        setViewMode(mode);
        if (mode === 'realtime') {
            setHistoricalData([]); // Clear historical data when switching back
        }
    };

    const handleTimeRangeChange = (days) => {
        setTimeRange(days);
    };

    if (error && !currentMetrics) {
        return (
            <div className="error-container">
                <div className="error-card">
                    <div className="error-icon">⚠️</div>
                    <h2>Connection Error</h2>
                    <p>Unable to connect to the backend server.</p>
                    <p className="error-message">{error}</p>
                    <p className="error-hint">Make sure the backend is running on http://localhost:8000</p>
                </div>
            </div>
        );
    }

    return (
        <div className="app">
            {/* Header */}
            <header className="header">
                <div className="container">
                    <div className="header-content">
                        <div className="logo-section">
                            <div className="logo">
                                <span className="logo-icon">📊</span>
                                <h1 className="logo-text">System Monitor</h1>
                            </div>
                            <div className="status-badge">
                                <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`}></span>
                                <span className="status-text">
                                    {isConnected ? 'Live' : 'Disconnected'}
                                </span>
                            </div>
                        </div>
                        {lastUpdate && (
                            <div className="last-update">
                                Last updated: {lastUpdate.toLocaleTimeString()}
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="main-content">
                <div className="container">
                    {/* Metric Cards */}
                    <div className="metrics-grid">
                        <MetricCard
                            title="CPU Usage"
                            value={currentMetrics?.cpu.percent.toFixed(1) || '0.0'}
                            unit="%"
                            icon="🖥️"
                            gradient="gradient-blue"
                        />
                        <MetricCard
                            title="RAM Usage"
                            value={currentMetrics?.ram.percent.toFixed(1) || '0.0'}
                            unit="%"
                            icon="💾"
                            gradient="gradient-green"
                        />
                        <MetricCard
                            title="Disk Usage"
                            value={currentMetrics?.disk.percent.toFixed(1) || '0.0'}
                            unit="%"
                            icon="💿"
                            gradient="gradient-orange"
                        />
                        <MetricCard
                            title="Active Processes"
                            value={processes.length}
                            unit="running"
                            icon="⚡"
                            gradient="gradient-purple"
                        />
                    </div>

                    {/* RAM Details */}
                    {currentMetrics && (
                        <div className="details-grid">
                            <div className="detail-card fade-in">
                                <h4>RAM Details</h4>
                                <div className="detail-row">
                                    <span>Used:</span>
                                    <span className="detail-value">
                                        {currentMetrics.ram.used_gb.toFixed(2)} GB
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span>Total:</span>
                                    <span className="detail-value">
                                        {currentMetrics.ram.total_gb.toFixed(2)} GB
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span>Available:</span>
                                    <span className="detail-value">
                                        {currentMetrics.ram.available_gb.toFixed(2)} GB
                                    </span>
                                </div>
                            </div>

                            <div className="detail-card fade-in">
                                <h4>Disk Details</h4>
                                <div className="detail-row">
                                    <span>Used:</span>
                                    <span className="detail-value">
                                        {currentMetrics.disk.used_gb.toFixed(2)} GB
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span>Total:</span>
                                    <span className="detail-value">
                                        {currentMetrics.disk.total_gb.toFixed(2)} GB
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span>Free:</span>
                                    <span className="detail-value">
                                        {currentMetrics.disk.free_gb.toFixed(2)} GB
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Charts */}
                    <div className="charts-section">
                        <div className="chart-controls">
                            <div className="view-mode-toggle">
                                <button
                                    className={`toggle-btn ${viewMode === 'realtime' ? 'active' : ''}`}
                                    onClick={() => handleViewModeChange('realtime')}
                                >
                                    📊 Real-Time
                                </button>
                                <button
                                    className={`toggle-btn ${viewMode === 'historical' ? 'active' : ''}`}
                                    onClick={() => handleViewModeChange('historical')}
                                >
                                    📈 Historical
                                </button>
                            </div>

                            {viewMode === 'historical' && (
                                <div className="time-range-selector">
                                    <button
                                        className={`range-btn ${timeRange === 7 ? 'active' : ''}`}
                                        onClick={() => handleTimeRangeChange(7)}
                                    >
                                        7 Days
                                    </button>
                                    <button
                                        className={`range-btn ${timeRange === 15 ? 'active' : ''}`}
                                        onClick={() => handleTimeRangeChange(15)}
                                    >
                                        15 Days
                                    </button>
                                    <button
                                        className={`range-btn ${timeRange === 30 ? 'active' : ''}`}
                                        onClick={() => handleTimeRangeChange(30)}
                                    >
                                        30 Days
                                    </button>
                                </div>
                            )}
                        </div>

                        {isLoadingHistory ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Loading historical data...</p>
                            </div>
                        ) : (
                            <Chart
                                data={historicalData}
                                dataKeys={['CPU', 'RAM', 'Disk']}
                                colors={['#3b82f6', '#10b981', '#f59e0b']}
                                title={viewMode === 'realtime'
                                    ? "Real-Time System Metrics (Last 60 seconds)"
                                    : `Historical System Metrics (Last ${timeRange} Days)`}
                                height={350}
                            />
                        )}
                    </div>

                    {/* Process Table */}
                    <div className="processes-section">
                        <ProcessTable processes={processes} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <p>System Monitoring Dashboard • Real-time OS metrics tracking</p>
                </div>
            </footer>
        </div>
    );
}

export default App;
