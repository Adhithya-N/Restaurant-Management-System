import { useEffect, useState } from 'react';

interface Order {
  order_id: string;
  token_number: number;
  status: string;
}

export default function TokenBoard() {
  const [orders, setOrders] = useState<Order[]>([]);

  const fetchDisplayBoard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/display/board');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch token board:", error);
    }
  };

  // Auto-refresh the TV screen every 3 seconds
  useEffect(() => {
    fetchDisplayBoard();
    const interval = setInterval(fetchDisplayBoard, 3000);
    return () => clearInterval(interval);
  }, []);

  const preparing = orders.filter(o => o.status === 'Cooking');
  const ready = orders.filter(o => o.status === 'Ready');

  return (
    <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-8 overflow-hidden">
      <h2 className="text-3xl font-black text-white mb-8 text-center tracking-widest uppercase">
        Order Status
      </h2>
      
      <div className="grid grid-cols-2 gap-12">
        {/* Preparing Column */}
        <div>
          <h3 className="text-2xl font-bold text-yellow-400 mb-6 text-center border-b border-gray-700 pb-4">
            Preparing
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {preparing.length === 0 ? <span className="text-gray-600">--</span> : preparing.map(order => (
              <div key={order.order_id} className="text-4xl font-bold text-gray-300 bg-gray-800 px-6 py-4 rounded-lg">
                {order.token_number}
              </div>
            ))}
          </div>
        </div>

        {/* Ready Column */}
        <div>
          <h3 className="text-2xl font-bold text-green-400 mb-6 text-center border-b border-gray-700 pb-4">
            Ready to Collect
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {ready.length === 0 ? <span className="text-gray-600">--</span> : ready.map(order => (
              <div key={order.order_id} className="text-5xl font-black text-green-400 bg-green-900/30 border border-green-500/50 px-8 py-5 rounded-lg animate-pulse">
                {order.token_number}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}