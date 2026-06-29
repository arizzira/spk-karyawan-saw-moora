import { useEffect, useState } from 'react';
import FormKaryawan from '../components/FormKaryawan';
import GuideCard from '../components/GuideCard';

const API_URL = 'http://127.0.0.1:8000/api/alternatif';

export default function DataKaryawan() {
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      setKaryawan(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Yakin ingin menghapus karyawan ${id}?`)) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (err) {
      alert('Gagal menghapus data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
          Master Data Karyawan
        </h1>
        <p className="text-slate-500 mt-1 text-sm md:text-base">
          Kelola data alternatif karyawan untuk penilaian.
        </p>
      </header>

      <GuideCard
        title="Cara Menggunakan Halaman Ini"
        steps={[
          "Langkah ini adalah langkah awal. Daftarkan semua karyawan yang akan dinilai.",
          "Isi form di sebelah kiri (ID seperti A1, A2 dan Nama Lengkap).",
          "Klik 'Simpan Data'. Data akan muncul di tabel sebelah kanan.",
          "Anda bisa menghapus data yang salah dengan klik tombol 'Hapus'.",
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-1">
          <FormKaryawan onSuccess={fetchData} />
        </div>

        <div className="lg:col-span-2 bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
          <h2 className="text-lg md:text-xl font-semibold mb-4 text-slate-700">
            Daftar Karyawan
          </h2>
          {loading ? (
            <p className="text-center py-8 text-slate-400">Memuat data...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-3 text-sm font-semibold text-slate-600">ID</th>
                    <th className="p-3 text-sm font-semibold text-slate-600">
                      Nama Lengkap
                    </th>
                    <th className="p-3 text-sm font-semibold text-slate-600 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {karyawan.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-6 text-center text-slate-400">
                        Belum ada data.
                      </td>
                    </tr>
                  ) : (
                    karyawan.map((k) => (
                      <tr
                        key={k.id_alternatif}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >
                        <td className="p-3 font-mono text-sm text-slate-600">
                          {k.id_alternatif}
                        </td>
                        <td className="p-3 font-medium text-slate-800">
                          {k.nama_karyawan}
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDelete(k.id_alternatif)}
                            className="px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100"
                          >
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}