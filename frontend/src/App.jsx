import React, { useState, useEffect } from 'react';
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

    // Fetch current metrics every second
    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const data = await metricsAPI.getCurrentMetrics();
                setCurrentMetrics(data);
                setIsConnected(true);
                setError(null);
                setLastUpdate(new Date());

                // Update historical data for charts (keep last 60 data points)
                setHistoricalData(prev => {
                    const newData = [...prev, {
                        time: new Date(data.timestamp).toLocaleTimeString(),
                        CPU: data.cpu.percent,
                        RAM: data.ram.percent,
                        Disk: data.disk.percent
                    }];
                    return newData.slice(-60); // Keep last 60 seconds
                });

                // Update processes
                if (data.top_processes) {
                    setProcesses(data.top_processes);
                }
            } catch (err) {
                console.error('Error fetching metrics:', err);
                setIsConnected(false);
                setError(err.message);
            }
        };

        // Initial fetch
        fetchMetrics();

        // Set up interval for real-time updates
        const interval = setInterval(fetchMetrics, 1000);

        return () => clearInterval(interval);
    }, []);

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
                        <Chart
                            data={historicalData}
                            dataKeys={['CPU', 'RAM', 'Disk']}
                            colors={['#3b82f6', '#10b981', '#f59e0b']}
                            title="Real-Time System Metrics (Last 60 seconds)"
                            height={350}
                        />
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
