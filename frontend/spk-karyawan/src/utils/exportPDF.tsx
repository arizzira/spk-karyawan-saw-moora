import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportOptions {
  includeCalculations: boolean;
}

export const exportToPDF = (data: any, criteriaInfo: any, options: ExportOptions = { includeCalculations: false }) => {
  const doc = new jsPDF();
  let yPos = 20;

  doc.setFontSize(16);
  doc.setTextColor(41, 128, 185);
  doc.text('LAPORAN HASIL SPK PEMILIHAN KARYAWAN TERBAIK', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Metode SAW (Simple Additive Weighting) & MOORA', 105, yPos, { align: 'center' });
  
  yPos += 10;
  doc.setTextColor(0);
  doc.text(`Tanggal: ${new Date().toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })}`, 105, yPos, { align: 'center' });

  yPos += 15;
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.text('1. KRITERIA DAN BOBOT', 14, yPos);
  
  const criteriaTable = Object.entries(criteriaInfo).map(([key, value]: [string, any]) => [
    key,
    value.nama,
    value.atribut,
    value.bobot
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Kode', 'Nama Kriteria', 'Atribut', 'Bobot']],
    body: criteriaTable,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  if (options.includeCalculations && data.detail_perhitungan) {
    const detail = data.detail_perhitungan;

    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text('2. PERHITUNGAN METODE SAW', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('a. Matriks Keputusan (X):', 14, yPos);
    
    const sawMatrixData = Object.entries(detail.saw.matriks_keputusan).map(([key, value]: [string, any]) => {
      const row: any = [key, value.nama];
      Object.keys(criteriaInfo).forEach(krit => {
        row.push(value.nilai[krit] || '-');
      });
      return row;
    });

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Alternatif', 'Nama', ...Object.keys(criteriaInfo)]],
      body: sawMatrixData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      styles: { fontSize: 8 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('b. Normalisasi Matriks (R):', 14, yPos);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('Rumus: r_ij = x_ij / max(x_ij) untuk Benefit | r_ij = min(x_ij) / x_ij untuk Cost', 14, yPos + 5);

    const sawNormalisasiData: any[] = [];
    Object.entries(detail.saw.normalisasi).forEach(([altId, altData]: [string, any]) => {
      Object.entries(altData.nilai).forEach(([kritId, nilaiData]: [string, any]) => {
        sawNormalisasiData.push([
          altId,
          altData.nama,
          kritId,
          (nilaiData as any).rumus,
          (nilaiData as any).hasil
        ]);
      });
    });

    autoTable(doc, {
      startY: yPos + 12,
      head: [['Alternatif', 'Nama', 'Kriteria', 'Perhitungan', 'Hasil']],
      body: sawNormalisasiData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      styles: { fontSize: 7 },
      columnStyles: {
        3: { cellWidth: 50 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('c. Nilai Terbobot:', 14, yPos);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('V_i = Sum (w_j x r_ij)', 14, yPos + 5);

    const sawTerbobotData: any[] = [];
    Object.entries(detail.saw.terbobot).forEach(([altId, altData]: [string, any]) => {
      Object.entries(altData.nilai).forEach(([kritId, nilaiData]: [string, any]) => {
        sawTerbobotData.push([
          altId,
          altData.nama,
          kritId,
          (nilaiData as any).rumus,
          (nilaiData as any).hasil
        ]);
      });
    });

    autoTable(doc, {
      startY: yPos + 12,
      head: [['Alternatif', 'Nama', 'Kriteria', 'Perhitungan', 'Hasil']],
      body: sawTerbobotData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
      styles: { fontSize: 7 },
      columnStyles: {
        3: { cellWidth: 50 }
      }
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('d. Nilai Preferensi Akhir (V):', 14, yPos);

    const sawAkhirData = Object.entries(detail.saw.nilai_preferensi).map(([altId, data]: [string, any]) => [
      altId,
      data.nama,
      data.nilai_akhir.toFixed(4)
    ]);

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Alternatif', 'Nama', 'Nilai Akhir']],
      body: sawAkhirData,
      theme: 'grid',
      headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text('3. PERHITUNGAN METODE MOORA', 14, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('a. Normalisasi Euclidean:', 14, yPos);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('x*_ij = x_ij / sqrt(Sum x_ij^2)', 14, yPos + 5);

    const mooraPembagiData = Object.entries(detail.moora.pembagi_euclidean).map(([kritId, data]: [string, any]) => [
      kritId,
      data.kriteria,
      data.hasil
    ]);

    autoTable(doc, {
      startY: yPos + 12,
      head: [['Kriteria', 'Nama', 'Nilai Pembagi']],
      body: mooraPembagiData,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.text('b. Optimasi (Benefit - Cost):', 14, yPos);
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text('y_i = Sum(w_j x x*_ij) Benefit - Sum(w_j x x*_ij) Cost', 14, yPos + 5);

    const mooraOptimasiData = Object.entries(detail.moora.optimasi).map(([altId, data]: [string, any]) => [
      altId,
      data.nama,
      data.total_benefit.toFixed(4),
      data.total_cost.toFixed(4),
      data.perhitungan,
      data.nilai_akhir.toFixed(4)
    ]);

    autoTable(doc, {
      startY: yPos + 12,
      head: [['Alternatif', 'Nama', 'Total Benefit', 'Total Cost', 'Perhitungan', 'Nilai Akhir']],
      body: mooraOptimasiData,
      theme: 'grid',
      headStyles: { fillColor: [155, 89, 182], textColor: 255 },
      styles: { fontSize: 7 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;
  }

  const rankingSectionNumber = options.includeCalculations ? 4 : 2;
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.text(`${rankingSectionNumber}. HASIL RANKING METODE SAW`, 14, yPos);

  const sawTable = data.ranking_saw.map((item: any, index: number) => [
    index + 1,
    item.id_alternatif,
    item.nama_karyawan,
    item.nilai_akhir.toFixed(4)
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Rank', 'ID', 'Nama Karyawan', 'Nilai Akhir']],
    body: sawTable,
    theme: 'grid',
    headStyles: { fillColor: [52, 152, 219], textColor: 255 },
    bodyStyles: { textColor: 50 },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  const mooraSectionNumber = options.includeCalculations ? 5 : 3;
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.text(`${mooraSectionNumber}. HASIL RANKING METODE MOORA`, 14, yPos);

  const mooraTable = data.ranking_moora.map((item: any, index: number) => [
    index + 1,
    item.id_alternatif,
    item.nama_karyawan,
    item.nilai_akhir.toFixed(4)
  ]);

  autoTable(doc, {
    startY: yPos + 5,
    head: [['Rank', 'ID', 'Nama Karyawan', 'Nilai Akhir']],
    body: mooraTable,
    theme: 'grid',
    headStyles: { fillColor: [155, 89, 182], textColor: 255 },
    bodyStyles: { textColor: 50 },
  });

  const kesimpulanSectionNumber = options.includeCalculations ? 6 : 4;
  yPos = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(12);
  doc.setTextColor(41, 128, 185);
  doc.text(`${kesimpulanSectionNumber}. KESIMPULAN`, 14, yPos);
  
  doc.setFontSize(10);
  doc.setTextColor(0);
  yPos += 8;
  doc.text('Berdasarkan hasil perhitungan kedua metode, karyawan terbaik adalah:', 14, yPos);
  
  yPos += 8;
  doc.setFontSize(11);
  doc.setTextColor(41, 128, 185);
  doc.text(`- Metode SAW  : ${data.ranking_saw[0]?.nama_karyawan} (${data.ranking_saw[0]?.id_alternatif}) - Nilai: ${data.ranking_saw[0]?.nilai_akhir.toFixed(4)}`, 14, yPos);
  
  yPos += 7;
  doc.text(`- Metode MOORA: ${data.ranking_moora[0]?.nama_karyawan} (${data.ranking_moora[0]?.id_alternatif}) - Nilai: ${data.ranking_moora[0]?.nilai_akhir.toFixed(4)}`, 14, yPos);

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Halaman ${i} dari ${pageCount}`, 105, 285, { align: 'center' });
  }

  const filename = options.includeCalculations 
    ? `Laporan_SPK_Lengkap_${new Date().getTime()}.pdf`
    : `Laporan_SPK_Ranking_${new Date().getTime()}.pdf`;
  
  doc.save(filename);
};