import { useState } from 'react';

interface BillItem {
  name: string;
  qty: number;
  price: number;
}

interface TableBill {
  id: string;
  tableName: string;
  items: BillItem[];
}

const activeBills: TableBill[] = [
  {
    id: "B-101",
    tableName: "Table 4",
    items: [
      { name: "Butter Chicken", qty: 2, price: 350 },
      { name: "Garlic Naan", qty: 3, price: 60 },
    ]
  },
  {
    id: "B-102",
    tableName: "Table 7",
    items: [
      { name: "Mutton Biryani", qty: 2, price: 450 },
      { name: "Masala Chai", qty: 1, price: 40 },
    ]
  }
];

function BillingSystem() {
  const [selectedBill, setSelectedBill] = useState<TableBill>(activeBills[0]);
  const [discount, setDiscount] = useState<number>(0); // Percentage

  // Calculations
  const subTotal = selectedBill.items.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const gst = Math.round(subTotal * 0.05); // 5% GST for restaurants
  const discountAmount = Math.round(subTotal * (discount / 100));
  const grandTotal = subTotal + gst - discountAmount;

  return (
    <div className="mt-10 pt-8 border-t border-gray-100 w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Quick Billing & Checkout</h2>
        <p className="text-sm text-gray-500">Select an active table to generate invoice</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Active Tables List */}
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wide">Active Tables</h3>
          {activeBills.map((bill) => (
            <button
              key={bill.id}
              onClick={() => setSelectedBill(bill)}
              className={`w-full text-left p-4 rounded-xl border transition flex justify-between items-center ${
                selectedBill.id === bill.id
                  ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <div>
                <p className="font-bold">{bill.tableName}</p>
                <p className={`text-xs ${selectedBill.id === bill.id ? 'text-blue-200' : 'text-gray-400'}`}>
                  {bill.items.length} items ordered
                </p>
              </div>
              <span className={`text-sm font-extrabold ${selectedBill.id === bill.id ? 'text-white' : 'text-gray-900'}`}>
                ₹{bill.items.reduce((sum, item) => sum + (item.price * item.qty), 0)}
              </span>
            </button>
          ))}
        </div>

        {/* Right Side: Invoice Summary & Settlement (Spans 2 columns) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h4 className="font-bold text-lg text-gray-800">Summary — {selectedBill.tableName}</h4>
              <span className="text-xs bg-gray-100 px-2.5 py-1 rounded font-mono text-gray-600 font-bold">{selectedBill.id}</span>
            </div>

            {/* Items Table */}
            <div className="space-y-3 mb-6">
              {selectedBill.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">{item.qty}x {item.name}</span>
                  <span className="font-medium text-gray-900">₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            {/* Calculations Area */}
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal</span>
                <span>₹{subTotal}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>CGST + SGST (5%)</span>
                <span>+ ₹{gst}</span>
              </div>
              <div className="flex justify-between items-center text-gray-500">
                <span>Apply Discount (%)</span>
                <input 
                  type="number" 
                  min="0" 
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="w-16 px-2 py-1 border border-gray-300 rounded text-right text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Grand Total & Print Action */}
          <div className="mt-6 pt-4 border-t border-dashed border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-bold text-gray-800">Grand Total</span>
              <span className="text-3xl font-extrabold text-gray-900">₹{grandTotal}</span>
            </div>
            
            <button 
              onClick={() => alert(`Processing Payment of ₹${grandTotal} via UPI / Cash`)}
              className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-green-700 transition flex items-center justify-center gap-2"
            >
              💵 Settle & Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingSystem;