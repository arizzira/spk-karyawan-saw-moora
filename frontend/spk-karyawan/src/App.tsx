import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DataKaryawan from './pages/DataKaryawan';
import DataKriteria from './pages/DataKriteria';
import DataPenilaian from './pages/DataPenilaian';
import HasilKalkulasi from './pages/HasilKalkulasi';
import PenilaianMatrix from './components/PenilaianMatrix';
import ImportData from './components/ImportData';

function AppContent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  
  const isFullscreen = new URLSearchParams(location.search).get('fullscreen') === 'true';

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-800">
      {!isFullscreen && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        {!isFullscreen && (
          <header className="md:hidden bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-30">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-600 hover:text-slate-900 p-2 rounded-md hover:bg-slate-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-bold text-slate-800">SPK Karyawan</h1>
            <div className="w-10"></div>
          </header>
        )}

        <main className="flex-1 p-4 md:p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<DataKaryawan />} />
            <Route path="/kriteria" element={<DataKriteria />} />
            
            <Route path="/penilaian" element={<PenilaianMatrix />} />
            
            <Route path="/hasil" element={<HasilKalkulasi />} />
            
            <Route path="/import" element={
              <div className="max-w-2xl mx-auto">
                <ImportData onSuccess={() => window.location.reload()} />
              </div>
            } />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;