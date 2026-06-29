import { useEffect, useState } from 'react';

export default function PenilaianMatrix() {
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [penilaian, setPenilaian] = useState<any[]>([]);
  const [selectedKaryawan, setSelectedKaryawan] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [savingCell, setSavingCell] = useState<string>('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [karyawanRes, kriteriaRes, penilaianRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/alternatif'),
        fetch('http://127.0.0.1:8000/api/kriteria'),
        fetch('http://127.0.0.1:8000/api/penilaian')
      ]);
      
      setKaryawan(await karyawanRes.json());
      setKriteria(await kriteriaRes.json());
      setPenilaian(await penilaianRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNilaiChange = async (idAlt: string, idKrit: string, newNilai: string) => {
    if (newNilai === '') return;

    const cellKey = `${idAlt}-${idKrit}`;
    setSavingCell(cellKey);

    try {
      const existingPenilaian = penilaian.find(
        p => p.id_alternatif === idAlt && p.id_kriteria === idKrit
      );

      if (existingPenilaian) {
        const res = await fetch(`http://127.0.0.1:8000/api/penilaian/${existingPenilaian.id_penilaian}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nilai_performa: parseFloat(newNilai) })
        });
        
        if (!res.ok) throw new Error('Gagal update nilai');
      } else {
        const res = await fetch('http://127.0.0.1:8000/api/penilaian', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id_alternatif: idAlt,
            id_kriteria: idKrit,
            nilai_performa: parseFloat(newNilai)
          })
        });
        
        if (!res.ok) throw new Error('Gagal simpan nilai');
      }

      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setSavingCell('');
    }
  };

  const handleDeleteNilai = async (idAlt: string, idKrit: string) => {
    if (!confirm(`Hapus nilai untuk ${idAlt} pada kriteria ${idKrit}?`)) return;

    const existingPenilaian = penilaian.find(
      p => p.id_alternatif === idAlt && p.id_kriteria === idKrit
    );

    if (!existingPenilaian) return;

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/penilaian/${existingPenilaian.id_penilaian}`, {
        method: 'DELETE'
      });
      
      if (!res.ok) throw new Error('Gagal hapus nilai');
      
      await fetchData();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    }
  };

  const filteredKaryawan = selectedKaryawan === 'all' 
    ? karyawan 
    : karyawan.filter(k => k.id_alternatif === selectedKaryawan);

  const getNilai = (idAlt: string, idKrit: string) => {
    const p = penilaian.find(x => x.id_alternatif === idAlt && x.id_kriteria === idKrit);
    return p ? p.nilai_performa : null;
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-slate-800">Matriks Penilaian</h1>
        <p className="text-slate-500 mt-1">Input dan edit nilai performa karyawan langsung di tabel</p>
      </header>

      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
        <p className="text-sm text-blue-800">
          💡 <strong>Tips:</strong> Klik pada cell nilai untuk mengedit. Nilai akan otomatis tersimpan saat Anda klik di luar cell (blur) atau tekan Enter.
        </p>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Filter Karyawan:
        </label>
        <select
          value={selectedKaryawan}
          onChange={(e) => setSelectedKaryawan(e.target.value)}
          className="w-full md:w-64 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">Semua Karyawan</option>
          {karyawan.map(k => (
            <option key={k.id_alternatif} value={k.id_alternatif}>
              {k.nama_karyawan} ({k.id_alternatif})
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <p className="text-center py-8 text-slate-400">Memuat data...</p>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100">
                <th className="border border-slate-300 p-3 text-left">Karyawan</th>
                {kriteria.map(k => (
                  <th key={k.id_kriteria} className="border border-slate-300 p-3 text-center">
                    <div className="text-sm font-bold">{k.id_kriteria}</div>
                    <div className="text-xs text-slate-600">{k.nama_kriteria}</div>
                    <div className={`text-xs ${k.atribut === 'Benefit' ? 'text-green-600' : 'text-red-600'}`}>
                      {k.atribut}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredKaryawan.map((k, idx) => (
                <tr key={k.id_alternatif} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="border border-slate-300 p-3 font-medium">
                    <div>{k.nama_karyawan}</div>
                    <div className="text-xs text-slate-500">{k.id_alternatif}</div>
                  </td>
                  {kriteria.map(krit => {
                    const cellKey = `${k.id_alternatif}-${krit.id_kriteria}`;
                    const nilai = getNilai(k.id_alternatif, krit.id_kriteria);
                    const isSaving = savingCell === cellKey;

                    return (
                      <td key={krit.id_kriteria} className="border border-slate-300 p-2 text-center relative">
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.01"
                            defaultValue={nilai ?? ''}
                            onBlur={(e) => {
                              const newNilai = e.target.value;
                              if (newNilai !== '' && newNilai !== String(nilai ?? '')) {
                                handleNilaiChange(k.id_alternatif, krit.id_kriteria, newNilai);
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.currentTarget.blur();
                              }
                            }}
                            disabled={isSaving}
                            className={`w-20 p-1 text-center border rounded text-sm font-mono ${
                              nilai !== null 
                                ? 'border-blue-300 bg-blue-50 text-blue-700' 
                                : 'border-slate-300 bg-white text-slate-400'
                            } focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none disabled:opacity-50`}
                            placeholder="-"
                          />
                          {nilai !== null && (
                            <button
                              onClick={() => handleDeleteNilai(k.id_alternatif, krit.id_kriteria)}
                              className="text-red-500 hover:text-red-700 text-xs px-1"
                              title="Hapus nilai"
                            >
                              ✕
                            </button>
                          )}
                          {isSaving && (
                            <span className="absolute right-1 top-1 text-xs text-blue-500">⏳</span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {filteredKaryawan.length === 0 && !loading && (
          <p className="text-center py-8 text-slate-400">Tidak ada data karyawan.</p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
          <div className="text-2xl font-bold text-blue-700">{karyawan.length}</div>
          <div className="text-sm text-blue-600">Total Karyawan</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
          <div className="text-2xl font-bold text-purple-700">{kriteria.length}</div>
          <div className="text-sm text-purple-600">Total Kriteria</div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-700">{penilaian.length}</div>
          <div className="text-sm text-green-600">Total Data Penilaian</div>
        </div>
      </div>
    </div>
  );
}