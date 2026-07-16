import { useState, useEffect } from 'react';

export default function AdminDashboard() {
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/menu');
      if (res.ok) setMenu(await res.json());
    } catch (error) {
      console.error("Admin Panel offline.");
    }
  };

  const updateItem = async (id: string, newUrl: string, newStock: number) => {
    try {
      await fetch(`http://localhost:8000/api/menu/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: newUrl, stock_count: newStock })
      });
      alert("✅ Item Updated Successfully!");
      fetchMenu(); // Refresh the panel to show the new image
    } catch (error) {
      alert("Failed to update item.");
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mt-8">
      <div className="mb-6 border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          ⚙️ Admin Control Center
        </h2>
        <p className="text-gray-500 text-sm mt-1">Live database management</p>
      </div>

      <div className="space-y-4">
        {menu.map(item => (
          <div key={item.id} className="flex flex-col md:flex-row gap-4 items-center bg-gray-50 border border-gray-200 p-4 rounded-xl">
            {/* Current Image Preview */}
            <img src={item.image_url} alt={item.name} className="w-24 h-24 object-cover rounded-lg shadow-sm bg-gray-200" />
            
            <div className="flex-1 w-full">
              <p className="font-black text-gray-800 text-lg">{item.name}</p>
              <label className="text-xs font-bold text-gray-500 uppercase">Image URL</label>
              <input 
                type="text" 
                defaultValue={item.image_url} 
                id={`url-${item.id}`}
                className="w-full text-sm border border-gray-300 p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                placeholder="Paste new image URL here..."
              />
            </div>
            
            <div className="w-full md:w-auto">
              <label className="text-xs font-bold text-gray-500 uppercase">Live Stock</label>
              <input 
                type="number" 
                defaultValue={item.stock_count} 
                id={`stock-${item.id}`}
                className="w-full md:w-20 text-lg font-bold border border-gray-300 p-2 mt-1 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
              />
            </div>

            <button 
              onClick={() => {
                const url = (document.getElementById(`url-${item.id}`) as HTMLInputElement).value;
                const stock = parseInt((document.getElementById(`stock-${item.id}`) as HTMLInputElement).value);
                updateItem(item.id, url, stock);
              }}
              className="w-full md:w-auto bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-bold transition shadow-md"
            >
              Update DB
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

