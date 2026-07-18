import { useEffect, useState } from 'react';

// Define the shape of our order data coming from FastAPI
interface Order {
  order_id: string;
  token_number: number;
  student_name: string;
  total_amount: number;
  status: string;
  items: string[];
}

export default function KitchenMonitor() {
  const [orders, setOrders] = useState<Order[]>([]);

  // Fetch active orders from the backend
  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/kitchen/queue');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch kitchen queue:", error);
    }
  };

  // Run when component loads and auto-refresh every 5 seconds
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  // Hit the Python backend to update the order status
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders(); // Refresh the UI instantly after updating
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">👨‍🍳 Kitchen Monitor</h2>
      
      {orders.length === 0 ? (
        <div className="text-center text-gray-500 py-8 font-medium">
          No active orders. Kitchen is clear!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <div key={order.order_id} className="border border-gray-200 rounded-lg p-5 shadow-sm bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-4xl font-black text-indigo-600">#{order.token_number}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-bold shadow-sm ${
                  order.status === 'New' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {order.status}
                </span>
              </div>
              
              <div className="mb-6 min-h-[80px]">
                <ul className="space-y-1">
                  {order.items.map((item, index) => (
                    <li key={index} className="text-gray-700 font-semibold text-lg">• {item}</li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                {order.status === 'New' && (
                  <button 
                    onClick={() => updateStatus(order.order_id, 'Cooking')}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 rounded-lg transition active:scale-95"
                  >
                    Start Cooking
                  </button>
                )}
                {order.status === 'Cooking' && (
                  <button 
                    onClick={() => updateStatus(order.order_id, 'Ready')}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition active:scale-95"
                  >
                    Mark as Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}