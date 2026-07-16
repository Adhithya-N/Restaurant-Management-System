import { useState, useEffect } from 'react';

// 1. Define the shape of the data coming from Python
interface Order {
  id: string;
  table: string;
  status: 'New' | 'Cooking' | 'Ready';
  items: string[];
  total: string;
}

function OrderBoard() {
  // 2. Set up React State to hold the live data
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 3. Fetch data from Python when the component loads
  useEffect(() => {
    fetch('http://localhost:8000/api/orders')
      .then((response) => response.json())
      .then((data) => {
        setActiveOrders(data);
        setLoading(false);
      })
      .catch((error) => console.error("API Connection Failed:", error));
  }, []);

  if (loading) {
    return <div className="mt-6 w-full p-8 text-center text-gray-500 font-bold">Connecting to Python Backend...</div>;
  }

  return (
    <div className="mt-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Live Orders (From API)</h2>
        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
          {activeOrders.length} Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Column 1: New Orders */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[300px]">
          <h3 className="text-md font-bold text-gray-600 mb-4 uppercase tracking-wide border-b pb-2">New 🔔</h3>
          {activeOrders.filter(o => o.status === "New").map(order => (
            <OrderCard key={order.id} order={order} color="bg-blue-50 border-blue-200 text-blue-700" />
          ))}
        </div>

        {/* Column 2: Cooking */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[300px]">
          <h3 className="text-md font-bold text-gray-600 mb-4 uppercase tracking-wide border-b pb-2">Cooking 🍳</h3>
          {activeOrders.filter(o => o.status === "Cooking").map(order => (
            <OrderCard key={order.id} order={order} color="bg-yellow-50 border-yellow-200 text-yellow-700" />
          ))}
        </div>

        {/* Column 3: Ready */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 min-h-[300px]">
          <h3 className="text-md font-bold text-gray-600 mb-4 uppercase tracking-wide border-b pb-2">Ready ✅</h3>
          {activeOrders.filter(o => o.status === "Ready").map(order => (
            <OrderCard key={order.id} order={order} color="bg-green-50 border-green-200 text-green-700" />
          ))}
        </div>
      </div>
    </div>
  );
}

// 4. Component Props and UI
interface OrderCardProps {
  order: Order;
  color: string;
}

function OrderCard({ order, color }: OrderCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-3 hover:shadow-md transition">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-gray-900">{order.id}</span>
        <span className={`text-xs font-bold px-2 py-1 rounded-md border ${color}`}>
          {order.table}
        </span>
      </div>
      <ul className="text-sm text-gray-600 mb-3 space-y-1">
        {order.items.map((item, i) => (
          <li key={i}>• {item}</li>
        ))}
      </ul>
      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
        <span className="font-extrabold text-gray-800">{order.total}</span>
        <button className="text-xs font-bold text-gray-500 hover:text-black transition">
          Update ➔
        </button>
      </div>
    </div>
  );
}

export default OrderBoard;