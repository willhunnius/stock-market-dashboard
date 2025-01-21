import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ComposedChart,
  ReferenceLine
} from 'recharts';

const StockChart = ({ data, chartType = 'line' }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: data.length - 1 });
  const [chartHeight, setChartHeight] = useState(window.innerHeight * 0.7);
  const containerRef = useRef(null);
  const scrollbarRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const rangeStartRef = useRef(0);
  const wheelTimeoutRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setChartHeight(window.innerHeight * 0.7);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Transform data once on component mount
  const transformedData = data.map(item => ({
    ...item,
    open: Number(item.open),
    close: Number(item.close),
    high: Number(item.high),
    low: Number(item.low),
    value: Number(item.close),
    color: Number(item.close) > Number(item.open) ? '#22c55e' : '#ef4444'
  }));

  // Calculate domain once
  const prices = transformedData.map(item => [item.high, item.low]).flat();
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const padding = (maxPrice - minPrice) * 0.05;
  const yDomain = [minPrice - padding, maxPrice + padding];

  // Debounced wheel handler
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    
    if (wheelTimeoutRef.current) {
      clearTimeout(wheelTimeoutRef.current);
    }

    wheelTimeoutRef.current = setTimeout(() => {
      const newZoom = Math.max(1, Math.min(10, zoomLevel * (e.deltaY > 0 ? 0.9 : 1.1)));
      
      if (newZoom === 1) {
        setVisibleRange({ start: 0, end: data.length - 1 });
        setZoomLevel(1);
        return;
      }

      const totalPoints = data.length;
      const visiblePoints = Math.floor(totalPoints / newZoom);
      
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      
      const mouseX = (e.clientX - rect.left) / rect.width;
      let start = Math.floor(visibleRange.start + (mouseX * (visibleRange.end - visibleRange.start)) - (visiblePoints / 2));
      start = Math.max(0, Math.min(start, totalPoints - visiblePoints));
      const end = Math.min(start + visiblePoints, totalPoints - 1);
      
      setZoomLevel(newZoom);
      setVisibleRange({ start, end });
    }, 50);
  }, [zoomLevel, data.length, visibleRange]);

  const handleScrollbarMouseDown = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    dragStartXRef.current = e.clientX;
    rangeStartRef.current = visibleRange.start;

    const handleMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      
      const scrollbarRect = scrollbarRef.current?.getBoundingClientRect();
      if (!scrollbarRect) return;

      const deltaX = e.clientX - dragStartXRef.current;
      const scrollbarWidth = scrollbarRect.width;
      const movePercent = deltaX / scrollbarWidth;
      
      const totalPoints = data.length;
      const visiblePoints = visibleRange.end - visibleRange.start;
      const maxStart = totalPoints - visiblePoints;
      
      let newStart = Math.round(rangeStartRef.current + (movePercent * totalPoints));
      newStart = Math.max(0, Math.min(newStart, maxStart));
      
      setVisibleRange({
        start: newStart,
        end: newStart + visiblePoints
      });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [data.length, visibleRange]);

  const CustomTooltip = useCallback(({ active, payload }) => {
    if (active && payload?.[0]?.payload) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded shadow-lg">
          <p className="text-sm font-semibold">
            {new Date(data.date).toLocaleDateString()}
          </p>
          <p className="text-sm">Open: ${data.open.toFixed(2)}</p>
          <p className="text-sm">High: ${data.high.toFixed(2)}</p>
          <p className="text-sm">Low: ${data.low.toFixed(2)}</p>
          <p className="text-sm">Close: ${data.close.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  }, []);

  // Get visible data slice
  const visibleData = transformedData.slice(visibleRange.start, visibleRange.end + 1);

  const renderChart = () => {
    if (chartType === 'line') {
      return (
        <LineChart data={visibleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis 
            domain={yDomain}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip content={CustomTooltip} />
          <Line 
            type="monotone"
            dataKey="value"
            stroke="#2563eb"
            dot={false}
          />
        </LineChart>
      );
    }

    return (
      <ComposedChart data={visibleData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="date"
          tickFormatter={(value) => new Date(value).toLocaleDateString()}
        />
        <YAxis 
          domain={yDomain}
          tickFormatter={(value) => value.toFixed(2)}
        />
        <Tooltip content={CustomTooltip} />
        {visibleData.map((item, index) => (
          <React.Fragment key={index}>
            <ReferenceLine
              segment={[
                { x: item.date, y: item.high },
                { x: item.date, y: item.low }
              ]}
              stroke={item.color}
              strokeWidth={2}
            />
            <ReferenceLine
              segment={[
                { x: item.date, y: item.open },
                { x: item.date, y: item.close }
              ]}
              stroke={item.color}
              strokeWidth={10}
            />
          </React.Fragment>
        ))}
      </ComposedChart>
    );
  };

  return (
    <div className="relative w-full">
      <div
        ref={containerRef}
        style={{ height: `${chartHeight}px` }}
        className="w-full min-h-[400px] max-h-[800px] overflow-hidden transition-all duration-300"
        onWheel={handleWheel}
      >
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>

      {/* Resize handle */}
      <div 
        className="w-full h-2 bg-gray-200 cursor-ns-resize hover:bg-gray-300 transition-colors"
        onMouseDown={(e) => {
          const startY = e.clientY;
          const startHeight = chartHeight;
          
          const handleMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const newHeight = Math.max(400, Math.min(800, startHeight + deltaY));
            setChartHeight(newHeight);
          };
          
          const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
          };
          
          document.addEventListener('mousemove', handleMouseMove);
          document.addEventListener('mouseup', handleMouseUp);
        }}
      />

      {/* Scrollbar */}
      {zoomLevel > 1 && (
        <div 
          ref={scrollbarRef}
          className="w-full h-2 bg-gray-200 mt-2 relative rounded select-none"
        >
          <div
            className="absolute h-full bg-blue-500 rounded cursor-grab hover:bg-blue-600 transition-colors"
            style={{
              left: `${(visibleRange.start / data.length) * 100}%`,
              width: `${((visibleRange.end - visibleRange.start) / data.length) * 100}%`,
            }}
            onMouseDown={handleScrollbarMouseDown}
          />
        </div>
      )}
    </div>
  );
};

export default StockChart;