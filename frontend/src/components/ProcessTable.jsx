import React from 'react';
import './ProcessTable.css';

const ProcessTable = ({ processes }) => {
    return (
        <div className="process-table-container fade-in">
            <h3 className="table-title">
                <span className="title-icon">⚡</span>
                Top CPU-Consuming Processes
            </h3>
            <div className="table-wrapper">
                <table className="process-table">
                    <thead>
                        <tr>
                            <th>Process Name</th>
                            <th>PID</th>
                            <th>CPU %</th>
                            <th>Memory (MB)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {processes.length > 0 ? (
                            processes.slice(0, 10).map((process, index) => (
                                <tr key={`${process.pid}-${index}`} className="table-row">
                                    <td className="process-name">
                                        <span className="process-icon">📦</span>
                                        {process.name || process.process_name}
                                    </td>
                                    <td className="process-pid">{process.pid}</td>
                                    <td className="process-cpu">
                                        <div className="cpu-cell">
                                            <span className="cpu-value">{process.cpu_percent?.toFixed(2) || '0.00'}%</span>
                                            <div className="cpu-bar">
                                                <div
                                                    className="cpu-bar-fill"
                                                    style={{ width: `${Math.min(process.cpu_percent || 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="process-memory">
                                        {(process.memory_mb || 0).toFixed(2)} MB
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="no-data">
                                    No process data available
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ProcessTable;
