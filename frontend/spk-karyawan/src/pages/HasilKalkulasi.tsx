import { useEffect, useState } from 'react';
import type { HasilKalkulasi as HasilType, KaryawanRanking } from '../types';
import GuideCard from '../components/GuideCard';
import DetailPerhitungan from '../components/DetailPerhitungan';
import { exportToPDF } from '../utils/exportPDF';

export default function HasilKalkulasi() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDetail, setShowDetail] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [includeCalculations, setIncludeCalculations] = useState(false);

  const calculate = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/calculate');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Gagal menghitung');
      }
      setData(await res.json());
    } catch (err: any) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportClick = () => {
    setShowExportModal(true);
  };

  const handleExportConfirm = () => {
    if (data?.detail_perhitungan) {
      exportToPDF(data, data.detail_perhitungan.kriteria_info, { 
        includeCalculations 
      });
    }
    setShowExportModal(false);
    setIncludeCalculations(false);
  };

  useEffect(() => { calculate(); }, []);

  const renderTable = (title: string, ranking: KaryawanRanking[], color: string) => (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200 flex-1">
      <h2 className={`text-lg md:text-xl font-bold mb-4 ${color}`}>{title}</h2>
      {ranking.length === 0 ? (
        <p className="text-center py-8 text-slate-400">Tidak ada data valid.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-3 text-sm font-semibold text-slate-600">Rank</th>
                <th className="p-3 text-sm font-semibold text-slate-600">Karyawan</th>
                <th className="p-3 text-sm font-semibold text-slate-600 text-right">Nilai Akhir</th>
              </tr>
            </thead>
            <tbody>
              {ranking.map((r, i) => (
                <tr key={r.id_alternatif} className={`border-b border-slate-100 ${i === 0 ? 'bg-yellow-50' : 'hover:bg-slate-50'}`}>
                  <td className="p-3">
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : <span className="text-slate-400">{i + 1}</span>}
                  </td>
                  <td className="p-3">
                    <div className="font-medium text-slate-800">{r.nama_karyawan}</div>
                    <div className="text-xs text-slate-400">{r.id_alternatif}</div>
                  </td>
                  <td className="p-3 text-right font-mono font-bold text-slate-700">{r.nilai_akhir}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  if (isFullscreen && data?.detail_perhitungan) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-6xl mx-auto">
          <DetailPerhitungan 
            data={data.detail_perhitungan} 
            isFullscreen={true}
            onExitFullscreen={() => setIsFullscreen(false)}
          />
        </div>
      </div>
    );
  }

  if (showDetail && data?.detail_perhitungan) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex gap-3">
          <button
            onClick={() => setShowDetail(false)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
          >
            <span>←</span> Kembali ke Hasil Ranking
          </button>
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <span>⛶</span> Mode Fullscreen (Untuk Screenshot)
          </button>
        </div>
        <DetailPerhitungan data={data.detail_perhitungan} />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Hasil Kalkulasi SPK</h1>
          <p className="text-slate-500 mt-1 text-sm md:text-base">Perbandingan ranking menggunakan metode SAW dan MOORA.</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDetail(true)}
            disabled={!data}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            Lihat Detail Perhitungan
          </button>
          <button
            onClick={calculate}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Menghitung...' : 'Hitung Ulang'}
          </button>
          <button
            onClick={handleExportClick}
            disabled={!data}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm transition-colors disabled:opacity-50"
          >
            Export PDF
          </button>
        </div>
      </header>

      <GuideCard 
        title="Cara Membaca Halaman Ini"
        steps={[
          "Sistem akan otomatis menghitung dan membandingkan metode SAW dan MOORA.",
          "Tabel KIRI adalah ranking metode SAW (penjumlahan terbobot).",
          "Tabel KANAN adalah ranking metode MOORA (optimasi rasio benefit - cost).",
          "Klik 'Lihat Detail Perhitungan' untuk melihat semua langkah matematis secara lengkap.",
          "Gunakan 'Mode Fullscreen' untuk screenshot halaman detail perhitungan.",
          "Klik 'Export PDF' untuk download laporan dengan atau tanpa detail perhitungan.",
          "Karyawan dengan medali 🥇 adalah rekomendasi terbaik."
        ]}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <p className="font-semibold">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {data ? (
        <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
          {renderTable('Ranking SAW (Simple Additive Weighting)', data.ranking_saw, 'text-blue-600')}
          {renderTable('Ranking MOORA (Multi-Objective Optimization)', data.ranking_moora, 'text-purple-600')}
        </div>
      ) : (
        !loading && !error && <p className="text-center py-12 text-slate-400">Klik "Hitung Ulang" untuk melihat hasil.</p>
      )}

      {showExportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">📄 Export PDF</h2>
            <p className="text-slate-600 mb-6">
              Pilih format laporan yang ingin Anda download:
            </p>

            <div className="space-y-4 mb-6">
              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={includeCalculations}
                  onChange={(e) => setIncludeCalculations(e.target.checked)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">
                    {includeCalculations ? '✅ Dengan Detail Perhitungan' : 'Dengan Detail Perhitungan'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Includes: Matriks keputusan, normalisasi, perhitungan terbobot, dan semua langkah matematis (lebih banyak halaman)
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input
                  type="checkbox"
                  checked={!includeCalculations}
                  onChange={() => setIncludeCalculations(false)}
                  className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <div>
                  <div className="font-semibold text-slate-800">
                    {!includeCalculations ? '✅ Hanya Hasil Ranking' : 'Hanya Hasil Ranking'}
                  </div>
                  <div className="text-sm text-slate-600 mt-1">
                    Includes: Kriteria, bobot, dan hasil ranking akhir saja (lebih ringkas)
                  </div>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowExportModal(false)}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleExportConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
              >
                Download PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}