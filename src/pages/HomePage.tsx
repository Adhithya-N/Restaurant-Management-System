import Navbar from '../components/Navbar';
import CanteenPOS from '../components/CanteenPOS';
import KitchenMonitor from '../components/KitchenMonitor';
import TokenBoard from '../components/TokenBoard'; // 1. Import it

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 pb-12">
      <Navbar />

      <main className="max-w-7xl mx-auto p-6 mt-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 mb-2">
          College Canteen Network
        </h1>
        <p className="text-gray-500 mb-6">
          High-volume digital wallet and token queue system.
        </p>
        
        <CanteenPOS />
        
        {/* We put the TV Board above the Kitchen Monitor so students see it first */}
        <TokenBoard />

        <KitchenMonitor />
        
      </main>
    </div>
  );
}

export default HomePage;