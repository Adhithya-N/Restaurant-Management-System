import { useEffect, useState } from 'react';

// --- Types ---
interface MenuItem {
  id: number;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface AIAnalysis {
  recommendation?: string;
  alert?: string;
}

export default function CanteenPOS() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/admin/menu');
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        }
      } catch (error) {
        console.error("Failed to fetch live menu:", error);
      }
    };
    fetchMenu();
  }, []);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckoutClick = async () => {
    setIsCheckoutOpen(true);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/checkout/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart.map(i => i.name), total: cartTotal })
      });
      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data);
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const placeOrder = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_name: "Adhithya N", 
          total_amount: cartTotal,
          items: cart.map(i => `${i.quantity}x ${i.name}`)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        alert(`Error: ${errorData.detail || "Failed to place order"}`);
        return;
      }

      setCart([]);
      setIsCheckoutOpen(false);
      alert("Order placed successfully!");
   }catch (error) {
      console.error("Caught error:", error); // This uses the variable, so the error goes away
      alert("Network error: Check if Python backend is running on port 8000");
    }
  };

  return (
    <div className="bg-gray-50 p-8 min-h-screen">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Menu Grid */}
        <div className="lg:col-span-2">
          <h2 className="text-3xl font-black text-gray-900 mb-6">🍽️ Live Menu</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {menuItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-48 object-cover bg-gray-200" />
                <div className="p-5">
                  <h3 className="text-xl font-bold">{item.name}</h3>
                  <p className="text-gray-500 mb-4">₹{item.price}</p>
                  <button onClick={() => addToCart(item)} className="w-full bg-indigo-600 text-white font-bold py-2 rounded-lg">Add to Cart</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cart Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-fit sticky top-8">
          <h2 className="text-2xl font-bold mb-6">🛒 Your Cart</h2>
          <div className="space-y-4 mb-6">
            {cart.map((item, idx) => (
              <div key={idx} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span className="font-bold">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
          <button onClick={handleCheckoutClick} disabled={cart.length === 0} className="w-full bg-green-500 text-white font-black py-4 rounded-xl disabled:bg-gray-300">Checkout</button>
        </div>
      </div>

      {/* AI Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-2xl max-w-md w-full">
            <h2 className="text-2xl font-black mb-6">Review Order</h2>
            {isAnalyzing ? <p>Agents analyzing...</p> : (
              <div className="mb-6 space-y-2">
                {aiAnalysis?.recommendation && <p className="text-indigo-600 font-bold">{aiAnalysis.recommendation}</p>}
                {aiAnalysis?.alert && <p className="text-red-600 font-bold">{aiAnalysis.alert}</p>}
              </div>
            )}
            <button onClick={placeOrder} className="w-full bg-black text-white font-black py-4 rounded-xl">Confirm & Pay ₹{cartTotal}</button>
          </div>
        </div>
      )}
    </div>
  );
}