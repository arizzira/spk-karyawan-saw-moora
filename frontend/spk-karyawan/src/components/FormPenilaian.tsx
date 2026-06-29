import { useState, useEffect } from 'react';

interface FormPenilaianProps { onSuccess?: () => void; }

export default function FormPenilaian({ onSuccess }: FormPenilaianProps) {
  const [karyawan, setKaryawan] = useState<any[]>([]);
  const [kriteria, setKriteria] = useState<any[]>([]);
  const [idAlt, setIdAlt] = useState('');
  const [idKrit, setIdKrit] = useState('');
  const [nilai, setNilai] = useState<number | ''>('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/alternatif').then(res => res.json()).then(data => { setKaryawan(data); if(data.length > 0) setIdAlt(data[0].id_alternatif); });
    fetch('http://127.0.0.1:8000/api/kriteria').then(res => res.json()).then(data => { setKriteria(data); if(data.length > 0) setIdKrit(data[0].id_kriteria); });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Menyimpan...');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/penilaian', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_alternatif: idAlt, id_kriteria: idKrit, nilai_performa: Number(nilai) }),
      });
      if (!res.ok) throw new Error('Gagal menyimpan');
      
      setStatus('Berhasil disimpan!');
      setNilai('');
      if (onSuccess) onSuccess();
    } catch (err: any) { setStatus(`Error: ${err.message}`); }
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold mb-4 text-slate-700">Input Nilai Performa</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Karyawan</label>
          <select value={idAlt} onChange={(e) => setIdAlt(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            {karyawan.map(k => <option key={k.id_alternatif} value={k.id_alternatif}>{k.nama_karyawan}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Kriteria</label>
          <select value={idKrit} onChange={(e) => setIdKrit(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
            {kriteria.map(k => <option key={k.id_kriteria} value={k.id_kriteria}>{k.id_kriteria} - {k.nama_kriteria}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Nilai Performa</label>
          <input type="number" step="0.01" value={nilai} onChange={(e) => setNilai(e.target.value === '' ? '' : Number(e.target.value))} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <button type="submit" className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-medium transition-colors">Simpan Nilai</button>
        {status && <p className="text-sm text-center text-slate-500">{status}</p>}
      </form>
    </div>
  );
}