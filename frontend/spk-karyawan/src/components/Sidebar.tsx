import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const menuItems = [
    { path: '/', label: 'Data Karyawan'},
    { path: '/kriteria', label: 'Data Kriteria'},
    { path: '/penilaian', label: 'Matriks Penilaian'},
    { path: '/import', label: 'Import Data Excel'},
    { path: '/hasil', label: 'Hasil Kalkulasi'},
  ];

  const handleLinkClick = () => {
    if (window.innerWidth < 768) onClose();
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      <div 
        className={`
          fixed md:static inset-y-0 left-0 z-50 
          w-64 bg-slate-900 text-slate-200 flex flex-col shadow-xl 
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 md:min-h-screen
        `}
      >
        <div className="p-6 border-b border-slate-700 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">SPK Karyawan</h1>
            <p className="text-xs text-slate-400 mt-1">SAW & MOORA Method</p>
          </div>
          <button onClick={onClose} className="md:hidden text-slate-400 hover:text-white text-2xl">&times;</button>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={handleLinkClick}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="p-4 text-center text-xs text-slate-500 border-t border-slate-700">
          © 2026 SPK Project
        </div>
      </div>
    </>
  );
}