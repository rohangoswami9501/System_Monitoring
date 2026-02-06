import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import './Chart.css';

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="tooltip-value" style={{ color: entry.color }}>
                        {entry.name}: {entry.value.toFixed(2)}%
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const Chart = ({ data, dataKeys, colors, title, height = 300 }) => {
    return (
        <div className="chart-container fade-in">
            <h3 className="chart-title">{title}</h3>
            <ResponsiveContainer width="100%" height={height}>
                <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        {dataKeys.map((key, index) => (
                            <linearGradient key={key} id={`gradient-${key}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={colors[index]} stopOpacity={0.3} />
                                <stop offset="95%" stopColor={colors[index]} stopOpacity={0} />
                            </linearGradient>
                        ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                        dataKey="time"
                        stroke="var(--text-secondary)"
                        style={{ fontSize: '12px' }}
                        interval="preserveStartEnd"
                        minTickGap={30}
                    />
                    <YAxis
                        stroke="var(--text-secondary)"
                        style={{ fontSize: '12px' }}
                        domain={[0, 100]}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    {dataKeys.map((key, index) => (
                        <Area
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={colors[index]}
                            strokeWidth={2}
                            fill={`url(#gradient-${key})`}
                            animationDuration={300}
                            isAnimationActive={false}
                        />
                    ))}
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export default Chart;
