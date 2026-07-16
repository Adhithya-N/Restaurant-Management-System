import Navbar from '../components/Navbar';
import CanteenPOS from '../components/CanteenPOS';
import KitchenMonitor from '../components/KitchenMonitor';
import TokenBoard from '../components/TokenBoard';
import AdminDashboard from '../components/AdminDashboard'; 

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 mt-6 space-y-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
            PSG iTech Campus Canteen
          </h1>
          <p className="text-gray-500">
            High-volume digital wallet and token queue system.
          </p>
        </div>
        
        {/* 1. The Ordering System */}
        <CanteenPOS />
        
        {/* 2. The TV Display */}
        <TokenBoard />
        
        {/* 3. The Kitchen Staff View */}
        <KitchenMonitor />
        
        {/* 4. The Secret Admin Panel */}
        <AdminDashboard />
        
      </main>
    </div>
  );
}

export default HomePage;