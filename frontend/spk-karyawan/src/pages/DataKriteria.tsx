import { useEffect, useState } from 'react';
import FormKriteria from '../components/FormKriteria';
import GuideCard from '../components/GuideCard';

const API_URL = 'http://127.0.0.1:8000/api/kriteria';

export default function DataKriteria() {
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { setKriteria(await (await fetch(API_URL)).json()); } 
    catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Hapus kriteria ${id}?`)) return;
    try { await fetch(`${API_URL}/${id}`, { method: 'DELETE' }); fetchData(); } 
    catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Master Data Kriteria</h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">Kelola kriteria dan bobot penilaian.</p>
      </header>

      <GuideCard 
        title="Cara Menggunakan Halaman Ini"
        steps={[
          "Tentukan kriteria penilaian sesuai proposal (C1 sampai C5).",
          "Isi form di kiri: Kode (C1, C2), Nama Kriteria, Bobot (total harus 1.0), dan Atribut (Benefit/Cost).",
          "Benefit = Semakin besar semakin baik (Kehadiran, KPI). Cost = Semakin kecil semakin baik (Pelanggaran).",
          "Klik 'Simpan Kriteria' dan pastikan total bobot mencapai 100% (1.0)."
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1"><FormKriteria onSuccess={fetchData} /></div>
        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-700">Daftar Kriteria</h2>
          {loading ? <p className="text-center py-8 text-slate-400">Memuat...</p> : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-sm font-semibold text-slate-600">Kode</th>
                    <th className="p-3 text-sm font-semibold text-slate-600">Nama</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-center">Bobot</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-center">Atribut</th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {kriteria.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-center text-slate-400">Belum ada kriteria.</td></tr>
                  ) : kriteria.map((k) => (
                    <tr key={k.id_kriteria} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="p-3 font-mono text-sm font-bold text-blue-600">{k.id_kriteria}</td>
                      <td className="p-3 text-slate-800">{k.nama_kriteria}</td>
                      <td className="p-3 text-center text-slate-600">{k.bobot}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${k.atribut === 'Benefit' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {k.atribut}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button onClick={() => handleDelete(k.id_kriteria)} className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100">Hapus</button>
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