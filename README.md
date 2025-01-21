# Stock Market Dashboard

A real-time stock market dashboard built with React and Python, featuring interactive charts, live updates, and detailed stock information.

## Features

- Real-time stock data updates
- Interactive line and candlestick charts
- Customizable time intervals (1m, 2m, 5m, 15m, 30m, 1h, etc.)
- Multiple timeframe options (1D, 5D, 1M, 3M, 6M, 1Y, etc.)
- Zoomable and scrollable charts
- Resizable chart window
- Live price updates

## Prerequisites

Before you begin, ensure you have the following installed:
- Python 3.11 or higher
- Node.js 18.x or higher
- Docker (optional)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/willhunnius/stock-market-dashboard.git
cd stock-market-dashboard
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
# For Windows
.\venv\Scripts\activate
# For Unix/MacOS
source venv/bin/activate
pip install fastapi uvicorn python-dotenv yfinance
```

3. Set up the frontend:
```bash
cd ../frontend
npm install
```

## Running the Application

### Without Docker

1. Start the backend server:
```bash
cd backend
# Activate virtual environment if not already activated
uvicorn main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

### With Docker

1. Build and run using Docker Compose:
```bash
docker compose up --build
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

## Usage

1. Enter a stock symbol (e.g., AAPL, MSFT, GOOGL)
2. Select your desired timeframe
3. Choose the time interval
4. Toggle between line chart and candlestick views
5. Enable/disable live updates
6. Use mouse wheel to zoom in/out of the chart
7. Drag the chart handle to resize vertically
8. Use the scrollbar to navigate through zoomed data

## Key Features Explained

### Chart Controls
- **Zoom**: Use mouse wheel to zoom in/out
- **Scroll**: When zoomed in, use the scrollbar to move through data
- **Resize**: Drag the bottom handle to adjust chart height
- **Live Updates**: Toggle button to enable/disable real-time data updates

### Chart Types
- **Line Chart**: Simple view of price movements
- **Candlestick Chart**: Detailed view showing open, high, low, and close prices

### Time Intervals
- Minute intervals: 1m, 2m, 5m, 15m, 30m
- Hour intervals: 1h, 90m
- Day/Week/Month intervals: 1d, 5d, 1wk, 1mo, 3mo

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE.md file for details

## Acknowledgments

- Built with React and FastAPI
- Uses yfinance for stock data
- Recharts for chart visualization
