import { useState } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface DetailPerhitunganProps {
  data: {
    saw: any;
    moora: any;
    kriteria_info: any;
  };
  isFullscreen?: boolean;
  onExitFullscreen?: () => void;
}

const MathFormula = ({ formula }: { formula: string }) => {
  try {
    const html = katex.renderToString(formula, {
      throwOnError: false,
      displayMode: true
    });
    return <div dangerouslySetInnerHTML={{ __html: html }} className="my-2 overflow-x-auto" />;
  } catch (e) {
    return <div className="text-red-500 text-sm">Error rendering formula</div>;
  }
};

export default function DetailPerhitungan({ data, isFullscreen = false, onExitFullscreen }: DetailPerhitunganProps) {
  const [activeTab, setActiveTab] = useState<'saw' | 'moora'>('saw');

  if (!data || !data.kriteria_info || !data.saw || !data.moora) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-bold text-yellow-800 mb-2">⚠️ Data Detail Perhitungan Belum Tersedia</h3>
        <p className="text-yellow-700">
          Backend belum mengembalikan data <code className="bg-yellow-100 px-1 rounded">detail_perhitungan</code>.
        </p>
      </div>
    );
  }

  const renderMatriksKeputusan = (matriks: any) => (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-slate-800 mb-3">Matriks Keputusan (X)</h3>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-slate-300">
          <thead>
            <tr className="bg-slate-100">
              <th className="border border-slate-300 p-2">Alternatif</th>
              {Object.keys(data.kriteria_info).map(krit => (
                <th key={krit} className="border border-slate-300 p-2">{krit}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Object.entries(matriks).map(([altId, dataAlt]: [string, any]) => (
              <tr key={altId}>
                <td className="border border-slate-300 p-2 font-medium">{dataAlt.nama}</td>
                {Object.keys(data.kriteria_info).map(krit => (
                  <td key={krit} className="border border-slate-300 p-2 text-center">
                    {dataAlt.nilai[krit] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSAW = () => (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-4">Metode SAW (Simple Additive Weighting)</h2>
      
      {renderMatriksKeputusan(data.saw.matriks_keputusan)}

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Langkah 1: Normalisasi Matriks (R)</h3>
        <MathFormula formula="r_{ij} = \begin{cases} \frac{x_{ij}}{\max(x_{ij})} & \text{untuk kriteria Benefit} \\ \frac{\min(x_{ij})}{x_{ij}} & \text{untuk kriteria Cost} \end{cases}" />
        
        <div className="space-y-4">
          {Object.entries(data.saw.normalisasi).map(([altId, dataAlt]: [string, any]) => (
            <div key={altId} className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">{dataAlt.nama} ({altId})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(dataAlt.nilai).map(([kritId, nilai]: [string, any]) => (
                  <div key={kritId} className="bg-white p-2 rounded border border-blue-200">
                    <div className="text-sm text-slate-600">{kritId}:</div>
                    <MathFormula formula={`${kritId}: ${nilai.rumus} = ${nilai.hasil}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-3">⚖️ Langkah 2: Perhitungan Nilai Terbobot</h3>
        <MathFormula formula="V_i = \sum_{j=1}^{n} w_j \times r_{ij}" />
        
        <div className="space-y-4">
          {Object.entries(data.saw.terbobot).map(([altId, dataAlt]: [string, any]) => (
            <div key={altId} className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-bold text-green-800 mb-2">{dataAlt.nama} ({altId})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(dataAlt.nilai).map(([kritId, nilai]: [string, any]) => (
                  <div key={kritId} className="bg-white p-2 rounded border border-green-200">
                    <div className="text-sm text-slate-600">{kritId}:</div>
                    <MathFormula formula={`${kritId}: ${nilai.rumus} = ${nilai.hasil}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Langkah 3: Nilai Preferensi Akhir (V)</h3>
        <div className="space-y-3">
          {Object.entries(data.saw.nilai_preferensi).map(([altId, dataAlt]: [string, any]) => (
            <div key={altId} className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
              <h4 className="font-bold text-purple-800 mb-2">{dataAlt.nama} ({altId})</h4>
              <MathFormula formula={`V_{${altId}} = ${dataAlt.nilai_akhir}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMOORA = () => (
    <div>
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Metode MOORA</h2>
      
      {renderMatriksKeputusan(data.moora.matriks_keputusan)}

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Langkah 1: Normalisasi Euclidean</h3>
        <MathFormula formula="x^*_{ij} = \frac{x_{ij}}{\sqrt{\sum_{i=1}^{m} x_{ij}^2}}" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {Object.entries(data.moora.pembagi_euclidean).map(([kritId, dataKrit]: [string, any]) => (
            <div key={kritId} className="bg-purple-50 p-3 rounded-lg">
              <h4 className="font-bold text-purple-800 text-sm">{kritId} - {dataKrit.kriteria}</h4>
              <MathFormula formula={`${dataKrit.rumus} = ${dataKrit.hasil}`} />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {Object.entries(data.moora.normalisasi).map(([altId, dataAlt]: [string, any]) => (
            <div key={altId} className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-bold text-blue-800 mb-2">{dataAlt.nama} ({altId})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(dataAlt.nilai).map(([kritId, nilai]: [string, any]) => (
                  <div key={kritId} className="bg-white p-2 rounded border border-blue-200">
                    <div className="text-sm text-slate-600">{kritId}:</div>
                    <MathFormula formula={`${kritId}: ${nilai.rumus} = ${nilai.hasil}`} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-bold text-slate-800 mb-3">Langkah 2: Optimasi (Benefit - Cost)</h3>
        <MathFormula formula="y_i = \sum_{j=1}^{g} w_j x^*_{ij} - \sum_{j=g+1}^{n} w_j x^*_{ij}" />
        
        <div className="space-y-4">
          {Object.entries(data.moora.optimasi).map(([altId, dataAlt]: [string, any]) => (
            <div key={altId} className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
              <h4 className="font-bold text-orange-800 mb-2">{dataAlt.nama} ({altId})</h4>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="bg-green-100 p-2 rounded">
                  <div className="text-sm text-green-700">Total Benefit:</div>
                  <MathFormula formula={`\\sum Benefit = ${dataAlt.total_benefit}`} />
                </div>
                <div className="bg-red-100 p-2 rounded">
                  <div className="text-sm text-red-700">Total Cost:</div>
                  <MathFormula formula={`\\sum Cost = ${dataAlt.total_cost}`} />
                </div>
              </div>
              <MathFormula formula={`y_{${altId}} = ${dataAlt.perhitungan} = ${dataAlt.nilai_akhir}`} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-slate-200 ${isFullscreen ? 'p-8' : 'p-6'}`}>
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-white z-10 pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800">Detail Perhitungan Matematis</h1>
        {isFullscreen && onExitFullscreen && (
          <button
            onClick={onExitFullscreen}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors flex items-center gap-2"
          >
            <span>✕</span> Keluar Fullscreen
          </button>
        )}
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 sticky top-20 bg-white z-10 pb-2">
        <button
          onClick={() => setActiveTab('saw')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'saw'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Metode SAW
        </button>
        <button
          onClick={() => setActiveTab('moora')}
          className={`px-6 py-3 font-medium transition-colors ${
            activeTab === 'moora'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          Metode MOORA
        </button>
      </div>

      <div className="pb-8">
        {activeTab === 'saw' ? renderSAW() : renderMOORA()}
      </div>
    </div>
  );
}