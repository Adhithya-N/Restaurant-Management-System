import { useState, useEffect } from 'react';

interface KitchenOrder {
  order_id: string;
  token_number: number;
  student_name: string;
  total_amount: number;
  status: string;
  items: string[];
}

export default function KitchenMonitor() {
  const [queue, setQueue] = useState<KitchenOrder[]>([]);

  useEffect(() => {
    fetchQueue(); 
    const interval = setInterval(fetchQueue, 3000); 
    return () => clearInterval(interval); 
  }, []);

  const fetchQueue = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/kitchen/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch (error) {
      console.error("Lost connection to backend.");
    }
  };

  // NEW: The function that talks to Python when a button is clicked
  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchQueue(); // Instantly refresh the screen after updating!
    } catch (error) {
      alert("Failed to update status.");
    }
  };

  return (
    <div className="bg-gray-900 rounded-2xl shadow-xl border border-gray-800 p-6 mt-8">
      <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            👨‍🍳 Live Kitchen Display 
            <span className="relative flex h-3 w-3 ml-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          </h2>
          <p className="text-gray-400 text-sm mt-1">Auto-syncing with Python Server...</p>
        </div>
        <div className="bg-gray-800 text-gray-300 px-4 py-2 rounded-lg font-mono font-bold border border-gray-700">
          Tickets: {queue.length}
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="h-48 flex items-center justify-center border-2 border-dashed border-gray-700 rounded-xl">
          <p className="text-gray-500 font-bold text-lg">No active orders. Kitchen is clear!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((order) => (
            <div key={order.order_id} className={`rounded-xl overflow-hidden shadow-sm flex flex-col ${order.status === 'Ready' ? 'opacity-60 grayscale' : 'bg-white'}`}>
              
              {/* Ticket Header (Changes color based on status) */}
              <div className={`p-3 flex justify-between items-center ${order.status === 'Ready' ? 'bg-green-400' : order.status === 'Cooking' ? 'bg-orange-400' : 'bg-yellow-400'}`}>
                <span className="font-black text-gray-900 text-xl">Token #{order.token_number}</span>
                <span className="text-xs font-bold bg-white text-gray-800 px-2 py-1 rounded">
                  {order.status}
                </span>
              </div>
              
              <div className="p-4 flex-grow bg-gray-50 border-x border-gray-200">
                <p className="text-xs text-gray-500 font-bold uppercase mb-2">Student: {order.student_name}</p>
                <ul className="space-y-2">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="font-bold text-gray-800 text-lg flex items-start gap-2">
                      <span>•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* NEW: Wired up the buttons! */}
              <div className="bg-gray-100 p-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                <button 
                  onClick={() => updateStatus(order.order_id, "Cooking")}
                  className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded transition"
                >
                  Cooking 🍳
                </button>
                <button 
                  onClick={() => updateStatus(order.order_id, "Ready")}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded transition"
                >
                  Ready ✅
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
