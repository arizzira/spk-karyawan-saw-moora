
export interface KaryawanRanking {
  id_alternatif: string;
  nama_karyawan: string;
  nilai_akhir: number;
}

export interface HasilKalkulasi {
  ranking_saw: KaryawanRanking[];
  ranking_moora: KaryawanRanking[];
}