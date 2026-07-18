import { useEffect, useState } from 'react';

// --- Types ---
interface ChartData { name: string; revenue: number; }
interface Analytics { total_revenue: number; total_orders: number; chart_data: ChartData[]; }
interface MenuItem { id: number; name: string; price: number; category: string; image: string; description: string; }

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeTab, setActiveTab] = useState<'analytics' | 'menu'>('analytics');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Form States
  const [newItem, setNewItem] = useState({ name: '', price: '', category: 'Main Course', image: '', description: 'Delicious item' });
  const [editingImageId, setEditingImageId] = useState<number | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Fetch Data
  const fetchData = async () => {
    try {
      const resAnalytics = await fetch('http://localhost:8000/api/admin/analytics');
      let analyticsData: Analytics | null = null;
      if (resAnalytics.ok) {
        analyticsData = await resAnalytics.json();
      }

      const resMenu = await fetch('http://localhost:8000/api/admin/menu');
      let menuData: MenuItem[] = [];
      if (resMenu.ok) {
        menuData = await resMenu.json();
      }

      // Update states together cleanly
      if (analyticsData) setAnalytics(analyticsData);
      if (menuData) setMenuItems(menuData);
    } catch (_error) {
      console.error("Fetch error caught in dashboard loop.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  // Handlers
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch('http://localhost:8000/api/admin/menu/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newItem, price: Number(newItem.price) })
      });
      setNewItem({ name: '', price: '', category: 'Main Course', image: '', description: 'Delicious item' });
      fetchData();
    } catch (_error) {
      console.error("Failed to add menu item");
    }
  };

  const handleUpdateImage = async (id: number) => {
    try {
      await fetch(`http://localhost:8000/api/admin/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: newImageUrl })
      });
      setEditingImageId(null);
      setNewImageUrl('');
      fetchData();
    } catch (_error) {
      console.error("Failed to update image");
    }
  };

  if (isLoading || !analytics) {
    return <div className="p-8 text-center text-gray-500 font-bold">Loading system dashboard analytics...</div>;
  }

  // Safe check extraction for Chart calculations
  const chartDataList = analytics?.chart_data || [];
  const maxRevenue = chartDataList.length > 0 ? Math.max(...chartDataList.map(d => d.revenue), 1) : 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mt-12">
      <div className="flex justify-between items-center mb-8 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">⚙️ Admin Control Panel</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'analytics' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Live Analytics
          </button>
          <button 
            onClick={() => setActiveTab('menu')}
            className={`px-4 py-2 font-bold rounded-lg transition ${activeTab === 'menu' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            Menu Manager
          </button>
        </div>
      </div>

      {/* TAB 1: ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
            <div className="bg-indigo-50 rounded-xl p-6 border border-indigo-100">
              <p className="text-indigo-600 font-semibold">Total Revenue</p>
              <p className="text-5xl font-black text-indigo-900">₹{analytics.total_revenue}</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
              <p className="text-blue-600 font-semibold">Orders Processed</p>
              <p className="text-5xl font-black text-blue-900">{analytics.total_orders}</p>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-700 mb-6">Revenue Trend</h3>
            <div className="flex items-end gap-4 h-48 mt-4">
              {chartDataList.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full bg-indigo-500 rounded-t-md relative transition-all" style={{ height: `${(day.revenue / maxRevenue) * 100}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded">₹{Math.round(day.revenue)}</div>
                  </div>
                  <span className="text-sm font-medium text-gray-500">{day.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MENU MANAGER */}
      {activeTab === 'menu' && (
        <div className="animate-fade-in">
          {/* Add New Item Form */}
          <form onSubmit={handleAddItem} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
              <input type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border rounded p-2" placeholder="e.g. Vada Pav" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
              <input type="number" required value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})} className="w-full border rounded p-2" placeholder="e.g. 40" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
              <select value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})} className="w-full border rounded p-2">
                <option>Main Course</option><option>Snacks</option><option>Beverages</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Image URL</label>
              <input type="text" required value={newItem.image} onChange={e => setNewItem({...newItem, image: e.target.value})} className="w-full border rounded p-2" placeholder="https://..." />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold p-2 rounded w-full h-[42px]">
              + Add Item
            </button>
          </form>

          {/* Current Menu List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item.id} className="border rounded-lg overflow-hidden flex flex-col">
                <img src={item.image} alt={item.name} className="w-full h-40 object-cover bg-gray-100" />
                <div className="p-4 flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-lg">{item.name}</h4>
                    <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded font-bold">₹{item.price}</span>
                  </div>
                  
                  {/* Image Edit Controls */}
                  {editingImageId === item.id ? (
                    <div className="mt-4 flex gap-2">
                      <input type="text" autoFocus value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} placeholder="New Image URL" className="flex-1 border rounded p-1 text-sm" />
                      <button onClick={() => handleUpdateImage(item.id)} className="bg-blue-600 text-white px-2 py-1 rounded text-sm font-bold">Save</button>
                    </div>
                  ) : (
                    <button onClick={() => { setEditingImageId(item.id); setNewImageUrl(item.image); }} className="mt-4 text-sm text-blue-600 hover:underline font-medium">
                      ✏️ Change Image
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

