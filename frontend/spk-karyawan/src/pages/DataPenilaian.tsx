import { useEffect, useState } from 'react';
import FormPenilaian from '../components/FormPenilaian';
import GuideCard from '../components/GuideCard';

const API_URL = 'http://127.0.0.1:8000/api/penilaian';

export default function DataPenilaian() {
  const [penilaian, setPenilaian] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { setPenilaian(await (await fetch(API_URL)).json()); } 
    catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus data penilaian ini?')) return;
    try { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); fetchData(); } 
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Data Penilaian</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Input dan kelola nilai performa karyawan per kriteria.</p>
      </header>

      <GuideCard 
        title="Cara Menggunakan Halaman Ini"
        steps={[
          "Ini adalah langkah inti. Masukkan nilai untuk SETIAP karyawan di SETIAP kriteria.",
          "Pilih Karyawan, lalu pilih Kriteria, dan masukkan angka nilainya (misal 80, 90).",
          "Klik 'Simpan Nilai'. Ulangi proses ini sampai SEMUA karyawan memiliki 5 nilai (C1 sampai C5).",
          "Total data penilaian harus: (Jumlah Karyawan x 5 Kriteria). Jika ada yang kurang, hasil kalkulasi akan error."
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1"><FormPenilaian onSuccess={fetchData} /></div>
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-700">Riwayat Penilaian</h2>
          {loading ? <p className="text-center py-8 text-slate-400">Memuat...</p> : (
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-50">
                  <tr className="border-b border-slate-200">
                    <th className="p-3 text-sm font-semibold text-slate-600">ID</th>
                    <th className="p-3 text-sm font-semibold text-slate-600">Karyawan</th>
                    <th className="p-3 text-sm font-semibold text-slate-600">Kriteria</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-center">Nilai</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {penilaian.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">Belum ada data.</td></tr>
                  ) : penilaian.map((p) => (
                    <tr key={p.id_penilaian} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 text-xs text-slate-400">#{p.id_penilaian}</td>
                      <td className="p-3 font-medium text-slate-800">{p.id_alternatif}</td>
                      <td className="p-3 text-slate-600">{p.id_kriteria}</td>
                      <td className="p-3 text-center font-bold text-blue-600">{p.nilai_performa}</td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDelete(p.id_penilaian)} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">Hapus</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}