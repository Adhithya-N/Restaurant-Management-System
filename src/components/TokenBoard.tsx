import { useState, useEffect } from 'react';

interface BoardToken {
  token_number: number;
  status: string;
}

export default function TokenBoard() {
  const [tokens, setTokens] = useState<BoardToken[]>([]);

  useEffect(() => {
    fetchBoard();
    const interval = setInterval(fetchBoard, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchBoard = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/display/board');
      if (res.ok) {
        const data = await res.json();
        setTokens(data);
      }
    } catch (error) {
      console.error("TV Board offline.");
    }
  };

  const preparing = tokens.filter(t => t.status === "Cooking");
  const ready = tokens.filter(t => t.status === "Ready");

  return (
    <div className="bg-black rounded-2xl shadow-2xl border-4 border-gray-800 p-6 mt-8 overflow-hidden">
      <div className="text-center mb-6 border-b border-gray-800 pb-4">
        <h2 className="text-3xl font-black text-white tracking-widest uppercase">Now Serving</h2>
      </div>

      <div className="grid grid-cols-2 gap-8 divide-x divide-gray-800">
        {/* Left Column: Preparing */}
        <div className="px-4">
          <h3 className="text-2xl font-bold text-orange-400 mb-6 text-center animate-pulse">Preparing...</h3>
          <div className="grid grid-cols-2 gap-4">
            {preparing.map(t => (
              <div key={`prep-${t.token_number}`} className="bg-gray-900 border border-orange-900/50 text-orange-300 text-3xl font-black text-center py-4 rounded-xl">
                {t.token_number}
              </div>
            ))}
            {preparing.length === 0 && <p className="col-span-2 text-center text-gray-700 font-bold">No tokens in queue</p>}
          </div>
        </div>

        {/* Right Column: Ready for Pickup */}
        <div className="px-4">
          <h3 className="text-2xl font-bold text-green-400 mb-6 text-center">Please Collect ✅</h3>
          <div className="grid grid-cols-2 gap-4">
            {ready.map(t => (
              <div key={`ready-${t.token_number}`} className="bg-green-900/20 border border-green-500 text-green-400 text-4xl font-black text-center py-4 rounded-xl shadow-[0_0_15px_rgba(74,222,128,0.2)]">
                {t.token_number}
              </div>
            ))}
            {ready.length === 0 && <p className="col-span-2 text-center text-gray-700 font-bold">Waiting for kitchen...</p>}
          </div>
        </div>
      </div>
    </div>
  );
}