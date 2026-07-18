import { useState, useEffect } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  stock_count: number;
  is_special: boolean;
  image_url: string;
  calories: number;
  diet_type: string;
  spice_level: number;
  ingredients: string;
  is_bestseller: boolean;
  is_new: boolean;
}

export default function CanteenPOS() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<{item: MenuItem, qty: number}[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [aiInsight, setAiInsight] = useState<{recommendation: string, alert: string} | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    fetch('http://localhost:8000/api/menu')
      .then(res => {
        if (!res.ok) throw new Error("API not ok");
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) {
          setMenu(data);
        } else {
          setMenu([]); 
        }
      })
      .catch(err => {
        console.error("Menu API Offline:", err);
        setMenu([]);
      });
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const calculateTotal = () => cart.reduce((sum, i) => sum + (i.item.price * i.qty), 0);

  const handleCheckoutClick = async () => {
    setShowCheckout(true);
    setIsAiLoading(true);
    
    try {
      const payload = {
        items: cart.map(c => c.item.name),
        total_amount: calculateTotal()
      };
      
      const res = await fetch('http://localhost:8000/api/ai/checkout-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAiInsight(data);
    } catch (err) {
      console.error("AI Engine offline");
    } finally {
      setIsAiLoading(false);
    }
  };

  const finalizeOrder = async () => {
    const payload = {
      student_id: "STU-2026-01",
      items: cart.map(c => ({ name: c.item.name, qty: c.qty, price: c.item.price }))
    };

    try {
      const res = await fetch('http://localhost:8000/api/orders/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(`Payment Successful! Your Token is #${data.token_number}`);
        setCart([]); 
        setShowCheckout(false);
        setAiInsight(null);
        window.location.reload(); 
      } else {
        alert("Transaction Failed: " + data.detail);
      }
    } catch (error) {
      alert("Bank Server Offline");
    }
  };

  const renderSpice = (level: number) => "🌶️".repeat(level);

  const DietIcon = ({ type }: { type: string }) => {
    const isVeg = type.toLowerCase() === 'veg' || type.toLowerCase() === 'vegan';
    const color = isVeg ? 'border-green-600 text-green-600' : 'border-red-600 text-red-600';
    return (
      <div className={`w-4 h-4 border-2 flex items-center justify-center ${color} bg-white`}>
        <div className={`w-2 h-2 rounded-full ${isVeg ? 'bg-green-600' : 'bg-red-600'}`}></div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden relative mb-12">
      <div className="bg-black text-white p-6 flex justify-between items-center">
        <h2 className="text-2xl font-black tracking-tight">Live Menu</h2>
        <div className="bg-white/20 px-4 py-2 rounded-full text-sm font-bold">
          🛒 {cart.reduce((sum, i) => sum + i.qty, 0)} Items (₹{calculateTotal()})
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {menu.length === 0 && (
          <div className="col-span-4 text-center py-10 font-bold text-red-500">
            Cannot load menu. Is the Python backend running?
          </div>
        )}
        {menu.map(item => (
          <div key={item.id} className="border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 relative flex flex-col">
            {item.is_bestseller && (
              <span className="absolute top-3 left-3 bg-yellow-400 text-black text-xs font-black px-2 py-1 rounded shadow-sm z-10">BESTSELLER</span>
            )}
            {item.is_new && (
              <span className="absolute top-3 left-3 bg-blue-500 text-white text-xs font-black px-2 py-1 rounded shadow-sm z-10">NEW</span>
            )}

            <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />
            
            <div className="p-4 flex flex-col flex-grow">
              <div className="flex justify-between items-start mb-1">
                <div className="flex items-start gap-2">
                  <div className="mt-1"><DietIcon type={item.diet_type} /></div>
                  <h3 className="font-bold text-lg text-gray-900 leading-tight">{item.name}</h3>
                </div>
                <p className="font-black text-green-600 text-lg">₹{item.price}</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2 font-medium flex-wrap">
                <span className="bg-gray-200 px-2 py-0.5 rounded">🔥 {item.calories} kcal</span>
                {item.spice_level > 0 && <span>{renderSpice(item.spice_level)}</span>}
              </div>
              
              <p className="text-xs text-gray-400 mb-4 line-clamp-2 flex-grow" title={item.ingredients}>
                {item.ingredients}
              </p>

              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-200">
                <p className="text-xs font-bold text-gray-500">Stock: {item.stock_count}</p>
                <button 
                  onClick={() => addToCart(item)}
                  disabled={item.stock_count === 0}
                  className={`px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm ${
                    item.stock_count > 0 ? 'bg-black text-white hover:bg-gray-800 active:scale-95' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {item.stock_count > 0 ? '+ Add' : 'Sold Out'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {cart.length > 0 && (
        <div className="border-t border-gray-200 p-6 bg-gray-50 flex justify-between items-center sticky bottom-0 z-20 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Total Order</p>
            <p className="text-3xl font-black text-gray-900">₹{calculateTotal()}</p>
          </div>
          <button 
            onClick={handleCheckoutClick}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-black text-lg transition shadow-lg transform hover:scale-105 active:scale-95"
          >
            Checkout (₹{calculateTotal()})
          </button>
        </div>
      )}

      {showCheckout && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-900 text-white p-5 text-center relative">
              <h3 className="text-xl font-black">Scan to Pay</h3>
              <p className="text-gray-400 text-sm mt-1">PSG iTech Canteen</p>
            </div>

            <div className="p-6 flex flex-col items-center">
              
              <div className="w-full mb-6">
                {isAiLoading ? (
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl flex items-center gap-3 animate-pulse">
                    <span className="text-xl">🤖</span>
                    <p className="text-xs font-bold text-blue-700">AI Recommender analyzing your cart...</p>
                  </div>
                ) : aiInsight && aiInsight.recommendation !== "No recommendation" ? (
                  <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl flex items-start gap-3 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full blur-xl"></div>
                    <span className="text-2xl relative z-10">✨</span>
                    <div className="relative z-10">
                      <p className="text-[10px] font-black text-purple-600 uppercase tracking-widest mb-1">AI Smart Combo</p>
                      <p className="text-sm font-bold text-gray-800">You should add: <span className="text-purple-700">{aiInsight.recommendation}</span></p>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="text-center mb-6">
                <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">Amount Due</p>
                <p className="text-4xl font-black text-gray-900">₹{calculateTotal()}</p>
              </div>

              <div className="bg-white p-2 rounded-2xl shadow-inner border-2 border-gray-100 mb-6 relative">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=canteen@psgitech&pn=PSG_Canteen&am=${calculateTotal()}`} 
                  alt="Payment QR" 
                  className="w-48 h-48"
                />
              </div>

              <div className="w-full space-y-3">
                <button 
                  onClick={finalizeOrder}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  <span>Simulate Payment Success</span>
                </button>
                <button 
                  onClick={() => setShowCheckout(false)}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-bold transition"
                >
                  Cancel Order
                </button>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

