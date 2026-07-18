import { useEffect, useState } from 'react';

interface ChartData {
  name: string;
  revenue: number;
}

interface Analytics {
  total_revenue: number;
  total_orders: number;
  chart_data: ChartData[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/analytics');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  };

  // Refresh data every 10 seconds to watch revenue grow live
  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 10000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return <div className="p-8 text-center text-gray-500">Loading analytics...</div>;

  // Calculate the max value for our custom CSS bar chart
  const maxRevenue = Math.max(...data.chart_data.map(d => d.revenue), 1);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">📈 Live Canteen Analytics</h2>
        <span className="flex items-center gap-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          Live Server Connection
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
          <p className="text-indigo-600 font-semibold mb-1">Total Revenue Today</p>
          <p className="text-5xl font-black text-indigo-900">₹{data.total_revenue}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
          <p className="text-blue-600 font-semibold mb-1">Total Orders Processed</p>
          <p className="text-5xl font-black text-blue-900">{data.total_orders}</p>
        </div>
      </div>

      {/* Simple Pure CSS Bar Chart */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-6">Revenue Trend (Weekly)</h3>
        <div className="flex items-end gap-4 h-48 mt-4">
          {data.chart_data.map((day, index) => {
            const heightPercentage = (day.revenue / maxRevenue) * 100;
            return (
              <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-indigo-500 rounded-t-md transition-all duration-500 hover:bg-indigo-400 relative"
                  style={{ height: `${heightPercentage}%` }}
                >
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded pointer-events-none transition-opacity whitespace-nowrap">
                    ₹{Math.round(day.revenue)}
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500">{day.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

