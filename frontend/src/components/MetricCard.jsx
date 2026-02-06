import React from 'react';
import './MetricCard.css';

const MetricCard = ({ title, value, unit, icon, gradient, trend }) => {
    return (
        <div className="metric-card fade-in">
            <div className="metric-header">
                <div className={`metric-icon ${gradient}`}>
                    {icon}
                </div>
                <div className="metric-info">
                    <h3 className="metric-title">{title}</h3>
                    {trend && (
                        <span className={`metric-trend ${trend > 0 ? 'up' : 'down'}`}>
                            {trend > 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
                        </span>
                    )}
                </div>
            </div>
            <div className="metric-value">
                <span className="value">{value}</span>
                <span className="unit">{unit}</span>
            </div>
            <div className="metric-bar">
                <div
                    className={`metric-bar-fill ${gradient}`}
                    style={{ width: `${Math.min(value, 100)}%` }}
                />
            </div>
        </div>
    );
};

export default MetricCard;
