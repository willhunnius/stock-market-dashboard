import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import StockChart from './components/StockChart.jsx';

function App() {
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState('1mo');
  const [timeInterval, setTimeInterval] = useState('1d');
  const [chartType, setChartType] = useState('line');
  const [stockData, setStockData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const timeframes = [
    { value: '1d', label: '1 Day' },
    { value: '5d', label: '5 Days' },
    { value: '1mo', label: '1 Month' },
    { value: '3mo', label: '3 Months' },
    { value: '6mo', label: '6 Months' },
    { value: '1y', label: '1 Year' },
    { value: '2y', label: '2 Years' },
    { value: '5y', label: '5 Years' },
    { value: 'max', label: 'Max' },
  ];

  const intervalOptions = [
    { value: '1m', label: '1 Minute' },
    { value: '2m', label: '2 Minutes' },
    { value: '5m', label: '5 Minutes' },
    { value: '15m', label: '15 Minutes' },
    { value: '30m', label: '30 Minutes' },
    { value: '60m', label: '1 Hour' },
    { value: '90m', label: '90 Minutes' },
    { value: '1d', label: '1 Day' },
    { value: '5d', label: '5 Days' },
    { value: '1wk', label: '1 Week' },
    { value: '1mo', label: '1 Month' },
    { value: '3mo', label: '3 Months' }
  ];

  const fetchStockData = useCallback(async () => {
    if (!symbol) return;
    
    setError('');
    
    try {
      const response = await axios.get(
        `http://localhost:8000/stock/${symbol}?timeframe=${timeframe}&interval=${timeInterval}&chart_type=${chartType}`
      );
      console.log('API Response:', response.data);
      setStockData(response.data);
    } catch (err) {
      setError('Error fetching stock data. Please try again.');
      console.error('Error:', err);
      setIsLive(false);
    }
  }, [symbol, timeframe, timeInterval, chartType]);

  // Initial fetch
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symbol) return;

    setLoading(true);
    await fetchStockData();
    setLoading(false);
    setIsLive(true);
  };

  // Live updates
  useEffect(() => {
    let interval;
    if (isLive && symbol) {
      interval = setInterval(fetchStockData, 5000); // Update every 5 seconds
    }
    return () => clearInterval(interval);
  }, [isLive, symbol, fetchStockData]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[90vw] mx-auto">
        <h1 className="text-3xl font-bold mb-8">Stock Market Dashboard</h1>
        
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Enter stock symbol (e.g., AAPL)"
              className="flex-1 p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {timeframes.map((tf) => (
                <option key={tf.value} value={tf.value}>
                  {tf.label}
                </option>
              ))}
            </select>
            <select
              value={timeInterval}
              onChange={(e) => setTimeInterval(e.target.value)}
              className="p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {intervalOptions.map((int) => (
                <option key={int.value} value={int.value}>
                  {int.label}
                </option>
              ))}
            </select>
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Search'}
            </button>
            <button 
              type="button"
              onClick={() => setIsLive(!isLive)}
              className={`px-4 py-2 rounded focus:ring-2 focus:ring-offset-2 ${
                isLive 
                  ? 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-500' 
                  : 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-500'
              }`}
            >
              Live Updates: {isLive ? 'ON' : 'OFF'}
            </button>
          </div>
        </form>

        {error && (
          <div className="p-4 mb-8 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {stockData && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{stockData.name}</h2>
              <div className="flex items-center gap-4">
                <select
                  value={chartType}
                  onChange={(e) => setChartType(e.target.value)}
                  className="p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="line">Line Chart</option>
                  <option value="candle">Candlestick</option>
                </select>
                {isLive && (
                  <span className="flex items-center text-green-500">
                    <span className="h-2 w-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                    Live
                  </span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">Current Price</p>
                <p className="text-2xl font-bold">${stockData.currentPrice?.toFixed(2)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded">
                <p className="text-gray-600">Currency</p>
                <p className="text-2xl font-bold">{stockData.currency}</p>
              </div>
            </div>
            
            {stockData.historical && (
              <StockChart 
                data={stockData.historical} 
                timeframe={timeframe}
                chartType={chartType}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;