import Navbar from '../components/Navbar';
import OrderBoard from '../components/OrderBoard';

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
          
          {/* We swapped the placeholder for the real OrderBoard! */}
          <OrderBoard />
          
        </div>
      </main>
    </div>
  );
}

export default HomePage;