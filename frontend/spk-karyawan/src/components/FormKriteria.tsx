import { useState } from 'react';

interface FormKriteriaProps { onSuccess?: () => void; }

export default function FormKriteria({ onSuccess }: FormKriteriaProps) {
  const [id, setId] = useState('');
  const [nama, setNama] = useState('');
  const [bobot, setBobot] = useState('');
  const [atribut, setAtribut] = useState('Benefit');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('Menyimpan...');
    try {
      const res = await fetch('http://127.0.0.1:8000/api/kriteria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_kriteria: id, nama_kriteria: nama, bobot: parseFloat(bobot), atribut: atribut }),
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.detail || 'Gagal'); }
      
      setStatus('Berhasil disimpan!');
      setId(''); setNama(''); setBobot('');
      if (onSuccess) onSuccess();
    } catch (err: any) { setStatus(`Error: ${err.message}`); }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-lg font-semibold mb-4 text-slate-700">Tambah Kriteria</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">ID (C1, C2, dst)</label>
          <input type="text" value={id} onChange={(e) => setId(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">Nama Kriteria</label>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Bobot (0-1)</label>
            <input type="number" step="0.01" value={bobot} onChange={(e) => setBobot(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Atribut</label>
            <select value={atribut} onChange={(e) => setAtribut(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
              <option value="Benefit">Benefit</option>
              <option value="Cost">Cost</option>
            </select>
          </div>
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors">Simpan Kriteria</button>
        {status && <p className="text-sm text-center text-slate-500">{status}</p>}
      </form>
    </div>
  );
}