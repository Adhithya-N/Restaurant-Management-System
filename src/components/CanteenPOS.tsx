import { useState, useEffect } from 'react';

// --- Types ---
interface Wallet {
  student_id: string;
  name: string;
  balance: number;
}

interface MenuItem {
  id: string;
  name: string;
  price: number;
  icon: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

// College Canteen Menu
const CANTEEN_MENU: MenuItem[] = [
  { id: "M1", name: "Masala Dosa", price: 50, icon: "🥞" },
  { id: "M2", name: "Veg Meals", price: 80, icon: "🍛" },
  { id: "M3", name: "Samosa (2 pcs)", price: 30, icon: "🥟" },
  { id: "M4", name: "Filter Coffee", price: 20, icon: "☕" },
];

export default function CanteenPOS() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  
  // Hardcoded for testing the specific user we created in Python
  const currentStudentId = "STU-2026-01";

  // 1. Fetch Wallet Data on Load
  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/wallet/${currentStudentId}`);
      if (res.ok) {
        const data = await res.json();
        setWallet(data);
      }
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  // 2. Cart Logic
  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 3. Checkout to FastAPI
  const placeOrder = async () => {
    if (cart.length === 0) return;
    
    try {
      const payload = {
        student_id: currentStudentId,
        items: cart.map(item => ({ name: item.name, qty: item.qty, price: item.price }))
      };

      const res = await fetch('http://localhost:8000/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setOrderStatus(`✅ Order Placed! Token #${data.token_number}`);
        setCart([]); // Clear cart
        fetchWallet(); // Refresh wallet to see the new balance!
        
        // Hide success message after 4 seconds
        setTimeout(() => setOrderStatus(null), 4000);
      } else {
        const err = await res.json();
        alert(`Checkout Failed: ${err.detail}`);
      }
    } catch (error) {
      alert("Network error connecting to backend.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900">Campus Canteen</h2>
        
        {/* Live Digital Wallet Display */}
        {wallet ? (
          <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{wallet.name}</p>
              <p className="text-sm font-mono text-gray-500">{wallet.student_id}</p>
            </div>
            <div className="text-2xl font-black text-blue-700">₹{wallet.balance}</div>
          </div>
        ) : (
          <span className="text-gray-400 font-bold animate-pulse">Syncing Wallet...</span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Tap to Add Menu */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3">Quick Add Menu</h3>
          <div className="grid grid-cols-2 gap-3">
            {CANTEEN_MENU.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                className="p-4 border border-gray-200 rounded-xl flex items-center gap-4 hover:bg-gray-50 hover:border-blue-300 transition text-left"
              >
                <span className="text-3xl">{item.icon}</span>
                <div>
                  <p className="font-bold text-gray-800">{item.name}</p>
                  <p className="text-blue-600 font-extrabold">₹{item.price}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Live Cart & Checkout */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 border-b pb-2">Your Tray</h3>
            
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm text-center mt-8 italic">Tray is empty</p>
            ) : (
              <div className="space-y-3 mb-4">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <span className="font-bold text-gray-700">{item.qty}x {item.name}</span>
                    <span className="text-gray-900 font-medium">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-gray-200 mt-auto">
            <div className="flex justify-between items-center mb-4">
              <span className="font-bold text-gray-600">Total</span>
              <span className="text-2xl font-black text-gray-900">₹{cartTotal}</span>
            </div>
            
            <button 
              onClick={placeOrder}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl font-bold transition flex justify-center items-center gap-2 ${
                cart.length > 0 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Pay & Print Token ➔
            </button>
            
            {orderStatus && (
              <p className="mt-3 text-center text-green-600 font-bold text-sm animate-bounce">{orderStatus}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}