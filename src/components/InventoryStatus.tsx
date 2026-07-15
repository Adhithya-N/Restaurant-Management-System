const inventoryItems = [
  { id: 1, name: "Chicken Breast", stock: "45 kg", status: "In Stock", color: "text-green-600 bg-green-50" },
  { id: 2, name: "Paneer / Cottage Cheese", stock: "4 kg", status: "Low Stock", color: "text-red-600 bg-red-50 animate-pulse" },
  { id: 3, name: "Basmati Rice", stock: "120 kg", status: "In Stock", color: "text-green-600 bg-green-50" },
  { id: 4, name: "Amul Butter", stock: "2 kg", status: "Out of Stock", color: "text-gray-600 bg-gray-100" },
];

function InventoryStatus() {
  return (
    <div className="mt-10 pt-8 border-t border-gray-100 w-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inventory & Ingredients</h2>
          <p className="text-sm text-gray-500">Real-time stock alerts for the kitchen</p>
        </div>
        <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition">
          View All Stock
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <th className="p-4">Ingredient Name</th>
              <th className="p-4">Current Stock</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {inventoryItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition">
                <td className="p-4 font-semibold text-gray-900">{item.name}</td>
                <td className="p-4 font-medium text-gray-600">{item.stock}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide ${item.color}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-xs font-bold text-blue-600 hover:underline">
                    Restock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryStatus;
