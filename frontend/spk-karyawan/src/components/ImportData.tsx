import { useState } from 'react';
import * as XLSX from 'xlsx';

interface ImportDataProps {
  onSuccess?: () => void;
}

export default function ImportData({ onSuccess }: ImportDataProps) {
  const [activeTab, setActiveTab] = useState<'kriteria' | 'karyawan' | 'penilaian'>('kriteria');
  const [status, setStatus] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus('Membaca file...');
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      let endpoint = '';
      let payload: any[] = [];

      if (activeTab === 'kriteria') {
        endpoint = 'http://127.0.0.1:8000/api/kriteria';
        payload = jsonData.map(row => ({
          id_kriteria: row.id_kriteria || row.kode || row.ID,
          nama_kriteria: row.nama_kriteria || row.nama || row.Nama,
          bobot: parseFloat(row.bobot || row.Bobot),
          atribut: row.atribut || row.Atribut
        }));
      } else if (activeTab === 'karyawan') {
        endpoint = 'http://127.0.0.1:8000/api/alternatif';
        payload = jsonData.map(row => ({
          id_alternatif: row.id_alternatif || row.id || row.ID,
          nama_karyawan: row.nama_karyawan || row.nama || row.Nama
        }));
      } else if (activeTab === 'penilaian') {
        endpoint = 'http://127.0.0.1:8000/api/penilaian';
        payload = jsonData.map(row => ({
          id_alternatif: row.id_alternatif || row.id_karyawan || row.ID_Karyawan,
          id_kriteria: row.id_kriteria || row.kode_kriteria || row.Kode_Kriteria,
          nilai_performa: parseFloat(row.nilai_performa || row.nilai || row.Nilai)
        }));
      }

      setStatus(`Mengupload ${payload.length} data...`);

      let successCount = 0;
      for (const item of payload) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
          });
          if (res.ok) successCount++;
        } catch (err) {
          console.error('Error uploading item:', item, err);
        }
      }

      setStatus(`Berhasil mengimport ${successCount} dari ${payload.length} data!`);
      if (onSuccess) onSuccess();
      
    } catch (err: any) {
      setStatus(`❌ Error: ${err.message}`);
    }
    
    e.target.value = '';
  };

  const downloadTemplate = () => {
    let template = [];
    let filename = '';

    if (activeTab === 'kriteria') {
      template = [
        { id_kriteria: 'C1', nama_kriteria: 'Persentase Kehadiran', bobot: 0.25, atribut: 'Benefit' },
        { id_kriteria: 'C2', nama_kriteria: 'Pencapaian Target Kerja', bobot: 0.35, atribut: 'Benefit' }
      ];
      filename = 'template_kriteria.xlsx';
    } else if (activeTab === 'karyawan') {
      template = [
        { id_alternatif: 'A1', nama_karyawan: 'Andi Saputra' },
        { id_alternatif: 'A2', nama_karyawan: 'Budi Santoso' }
      ];
      filename = 'template_karyawan.xlsx';
    } else {
      template = [
        { id_alternatif: 'A1', id_kriteria: 'C1', nilai_performa: 90 },
        { id_alternatif: 'A1', id_kriteria: 'C2', nilai_performa: 85 }
      ];
      filename = 'template_penilaian.xlsx';
    }

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h2 className="text-xl font-semibold mb-4 text-slate-800">Import Data</h2>
      
      <div className="flex gap-2 mb-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('kriteria')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'kriteria' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
          }`}
        >
          Kriteria
        </button>
        <button
          onClick={() => setActiveTab('karyawan')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'karyawan' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
          }`}
        >
          Karyawan
        </button>
        <button
          onClick={() => setActiveTab('penilaian')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'penilaian' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'
          }`}
        >
          Penilaian
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <p className="text-sm text-blue-800 font-medium mb-2">📋 Format File Excel/CSV:</p>
        <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
          {activeTab === 'kriteria' && (
            <>
              <li>id_kriteria (contoh: C1, C2)</li>
              <li>nama_kriteria (contoh: Kehadiran)</li>
              <li>bobot (angka desimal: 0.25)</li>
              <li>atribut (Benefit/Cost)</li>
            </>
          )}
          {activeTab === 'karyawan' && (
            <>
              <li>id_alternatif (contoh: A1, A2)</li>
              <li>nama_karyawan (contoh: Andi Saputra)</li>
            </>
          )}
          {activeTab === 'penilaian' && (
            <>
              <li>id_alternatif (contoh: A1)</li>
              <li>id_kriteria (contoh: C1)</li>
              <li>nilai_performa (angka: 85)</li>
            </>
          )}
        </ul>
      </div>

      <div className="space-y-3">
        <button
          onClick={downloadTemplate}
          className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 font-medium transition-colors"
        >
          Download Template Excel
        </button>

        <label className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors cursor-pointer block text-center">
          Upload File Excel/CSV
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {status && (
          <p className="text-sm text-center text-slate-600 mt-2">{status}</p>
        )}
      </div>
    </div>
  );
}