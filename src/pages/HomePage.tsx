import Navbar from '../components/Navbar';
import OrderBoard from '../components/OrderBoard';
import InventoryStatus from '../components/InventoryStatus';
import BillingSystem from '../components/BillingSystem'; // 1. Imported our new billing system!

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Welcome to the Dashboard
          </h1>
          <p className="mt-2 text-gray-500">
            System is live. Select a module from the navigation to begin managing orders, inventory, or billing.
          </p>
          
          {/* Live tracking blocks */}
          <OrderBoard />
          <InventoryStatus />
          
          {/* 2. Added the Billing block right here */}
          <BillingSystem />
          
        </div>
      </main>
    </div>
  );
}

export default HomePage;