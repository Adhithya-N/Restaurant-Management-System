import { useState, useEffect } from 'react';

interface Wallet {
  student_id: string;
  name: string;
  balance: number;
}

// 1. New dynamic menu interface matching our Python DB
interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock_count: number;
  is_special: boolean;
  time_slot: string;
  image_url: string;
}

interface CartItem extends MenuItem {
  qty: number;
}

export default function CanteenPOS() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderStatus, setOrderStatus] = useState<string | null>(null);
  
  const currentStudentId = "STU-2026-01";

  useEffect(() => {
    fetchWallet();
    fetchMenu();
  }, []);

  const fetchWallet = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/wallet/${currentStudentId}`);
      if (res.ok) setWallet(await res.json());
    } catch (error) {
      console.error("Failed to fetch wallet:", error);
    }
  };

  // 2. Fetch the live SQLite data!
  const fetchMenu = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/menu`);
      if (res.ok) setMenu(await res.json());
    } catch (error) {
      console.error("Failed to fetch menu:", error);
    }
  };

  const addToCart = (item: MenuItem) => {
    if (item.stock_count === 0) return; // Prevent adding sold out items
    
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        // Prevent adding more than what is in stock
        if (existing.qty >= item.stock_count) return prev;
        return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

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
        setCart([]); 
        fetchWallet(); 
        fetchMenu(); // Refresh menu to instantly update the stock counts!
        setTimeout(() => setOrderStatus(null), 4000);
      } else {
        const err = await res.json();
        alert(`Checkout Failed: ${err.detail}`);
      }
    } catch (error) {
      alert("Network error connecting to backend.");
    }
  };

  // 3. Logic for the exact stock labels from the iTech Manual
  const getStockLabel = (count: number) => {
    if (count === 0) return <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded">Sold out</span>;
    if (count <= 2) return <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded animate-pulse">Getting over soon</span>;
    if (count <= 10) return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-1 rounded">Only a few left</span>;
    return null; // Plenty in stock
  };

  const specialItem = menu.find(item => item.is_special);
  const regularMenu = menu.filter(item => !item.is_special);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h2 className="text-2xl font-extrabold text-gray-900">Campus Canteen</h2>
        
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
        {/* Left Side: Live Menu */}
        <div className="md:col-span-2">
          
          {/* Today's Special Hero Card */}
          {specialItem && (
            <div className="mb-8 relative rounded-2xl overflow-hidden shadow-md group cursor-pointer" onClick={() => addToCart(specialItem)}>
              <img src={specialItem.image_url} alt={specialItem.name} className="w-full h-48 object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6">
                <span className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-2 py-1 rounded w-max mb-2">Chef's Special</span>
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-3xl font-black text-white">{specialItem.name}</h3>
                    <p className="text-gray-300 font-medium text-sm mt-1">{specialItem.category} • {specialItem.time_slot}</p>
                  </div>
                  <div className="text-right">
                    {getStockLabel(specialItem.stock_count)}
                    <p className="text-3xl font-black text-white mt-1">₹{specialItem.price}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide mb-3 border-b pb-2">Live Menu</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {regularMenu.map(item => (
              <button 
                key={item.id}
                onClick={() => addToCart(item)}
                disabled={item.stock_count === 0}
                className={`p-0 border rounded-xl flex flex-col overflow-hidden hover:shadow-md transition text-left ${item.stock_count === 0 ? 'opacity-50 grayscale cursor-not-allowed border-gray-200' : 'border-gray-200 hover:border-blue-300'}`}
              >
                <img src={item.image_url} alt={item.name} className="w-full h-32 object-cover" />
                <div className="p-4 w-full">
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-bold text-gray-900 text-lg">{item.name}</p>
                    <p className="text-blue-600 font-black text-lg">₹{item.price}</p>
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-gray-500 uppercase font-bold tracking-wide">{item.category}</p>
                    {getStockLabel(item.stock_count)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Live Cart & Checkout */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 flex flex-col justify-between h-max sticky top-6">
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
              <span className="font-bold text-gray-600">Total Amount</span>
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
              Confirm & Pay ➔
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