import { useState } from 'react';

interface FormKaryawanProps {
  onSuccess?: () => void;
}

export default function FormKaryawan({ onSuccess }: FormKaryawanProps) {
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus('');

    try {
      const response = await fetch('http://127.0.0.1:8000/api/alternatif', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          id_alternatif: id, 
          nama_karyawan: nama 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Gagal menyimpan data');
      }
      
      setStatus('✅ Data karyawan berhasil disimpan!');
      setId('');
      setNama('');
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => setStatus(''), 3000);
      
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-6 text-slate-800 flex items-center gap-2">
        Tambah Karyawan Baru
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label 
            htmlFor="id_karyawan" 
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            ID Karyawan
          </label>
          <input
            id="id_karyawan"
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value.toUpperCase())}
            placeholder="Contoh: A1, A2, A3"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
            disabled={loading}
          />
          <p className="mt-1.5 text-xs text-slate-500">
            Gunakan format: A1, A2, A3, dst.
          </p>
        </div>

        <div>
          <label 
            htmlFor="nama_karyawan" 
            className="block text-sm font-medium text-slate-700 mb-2"
          >
            Nama Lengkap
          </label>
          <input
            id="nama_karyawan"
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama lengkap karyawan"
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Menyimpan...
            </>
          ) : (
            <>
              Simpan Data
            </>
          )}
        </button>

        {status && (
          <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
            status.includes('✅') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {status}
          </div>
        )}
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
          <span>ℹ️</span>
          Informasi
        </h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          <li>ID harus unik (tidak boleh sama)</li>
          <li>Gunakan format A1, A2, A3, dst.</li>
          <li>Nama lengkap akan ditampilkan di hasil ranking</li>
        </ul>
      </div>
    </div>
  );
}