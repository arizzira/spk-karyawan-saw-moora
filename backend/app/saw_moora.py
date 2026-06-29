import math
from sqlalchemy.orm import Session

import models

def calculate_all(db: Session):
    kriteria_list = db.query(models.Kriteria).all()
    alternatif_list = db.query(models.Alternatif).all()
    penilaian_list = db.query(models.Penilaian).all()

    if not kriteria_list or not alternatif_list or not penilaian_list:
        return {"error": "Data Kriteria, Alternatif, atau Penilaian belum lengkap."}

    total_kriteria_wajib = len(kriteria_list)

    matrix = {}
    for p in penilaian_list:
        if p.id_alternatif not in matrix:
            matrix[p.id_alternatif] = {}
        matrix[p.id_alternatif][p.id_kriteria] = p.nilai_performa

    kriteria_info = {
        k.id_kriteria: {
            'bobot': k.bobot, 
            'atribut': k.atribut,
            'nama': k.nama_kriteria
        } 
        for k in kriteria_list
    }

    nilai_per_kriteria = {k.id_kriteria: [] for k in kriteria_list}
    for alt_id, kriteria_dict in matrix.items():
        for krit_id, nilai in kriteria_dict.items():
            nilai_per_kriteria[krit_id].append(nilai)

    alternatif_valid = [
        alt for alt in alternatif_list 
        if alt.id_alternatif in matrix and len(matrix[alt.id_alternatif]) == total_kriteria_wajib
    ]

    if not alternatif_valid:
        return {"error": "Tidak ada karyawan yang memiliki data penilaian lengkap."}

    detail_saw = {
        "matriks_keputusan": {},
        "normalisasi": {},
        "terbobot": {},
        "nilai_preferensi": {}
    }

    for alt in alternatif_valid:
        alt_id = alt.id_alternatif
        detail_saw["matriks_keputusan"][alt_id] = {
            "nama": alt.nama_karyawan,
            "nilai": matrix[alt_id]
        }

    for alt in alternatif_valid:
        alt_id = alt.id_alternatif
        detail_saw["normalisasi"][alt_id] = {"nama": alt.nama_karyawan, "nilai": {}}
        detail_saw["terbobot"][alt_id] = {"nama": alt.nama_karyawan, "nilai": {}}
        
        total_v = 0
        for krit in kriteria_list:
            krit_id = krit.id_kriteria
            nilai_asli = matrix[alt_id][krit_id]
            atribut = kriteria_info[krit_id]['atribut'].lower()
            bobot = kriteria_info[krit_id]['bobot']
            
            kumpulan_nilai = nilai_per_kriteria[krit_id]
            if atribut == 'benefit':
                nilai_max = max(kumpulan_nilai)
                r_ij = nilai_asli / nilai_max if nilai_max != 0 else 0
                detail_saw["normalisasi"][alt_id]["nilai"][krit_id] = {
                    "rumus": f"{nilai_asli} / {nilai_max}",
                    "hasil": round(r_ij, 4)
                }
            else:
                nilai_min = min(kumpulan_nilai)
                r_ij = nilai_min / nilai_asli if nilai_asli != 0 else 0
                detail_saw["normalisasi"][alt_id]["nilai"][krit_id] = {
                    "rumus": f"{nilai_min} / {nilai_asli}",
                    "hasil": round(r_ij, 4)
                }
            
            nilai_terbobot = r_ij * bobot
            detail_saw["terbobot"][alt_id]["nilai"][krit_id] = {
                "rumus": f"{round(r_ij, 4)} × {bobot}",
                "hasil": round(nilai_terbobot, 4)
            }
            total_v += nilai_terbobot
        
        detail_saw["nilai_preferensi"][alt_id] = {
            "nama": alt.nama_karyawan,
            "nilai_akhir": round(total_v, 4)
        }

    hasil_saw = sorted(
        [{"id_alternatif": alt_id, "nama_karyawan": data["nama"], "nilai_akhir": data["nilai_akhir"]} 
         for alt_id, data in detail_saw["nilai_preferensi"].items()],
        key=lambda x: x['nilai_akhir'], 
        reverse=True
    )

    detail_moora = {
        "matriks_keputusan": detail_saw["matriks_keputusan"],
        "pembagi_euclidean": {},
        "normalisasi": {},
        "terbobot": {},
        "optimasi": {}
    }

    for krit_id, values in nilai_per_kriteria.items():
        jumlah_kuadrat = sum([v**2 for v in values])
        pembagi = math.sqrt(jumlah_kuadrat)
        detail_moora["pembagi_euclidean"][krit_id] = {
            "kriteria": kriteria_info[krit_id]['nama'],
            "rumus": f"\\sqrt{{{' + '.join([f'{v}^2' for v in values])}}}",
            "hasil": round(pembagi, 4)
        }

    for alt in alternatif_valid:
        alt_id = alt.id_alternatif
        detail_moora["normalisasi"][alt_id] = {"nama": alt.nama_karyawan, "nilai": {}}
        detail_moora["terbobot"][alt_id] = {"nama": alt.nama_karyawan, "nilai": {}}
        
        total_benefit = 0
        total_cost = 0

        for krit in kriteria_list:
            krit_id = krit.id_kriteria
            nilai_asli = matrix[alt_id][krit_id]
            atribut = kriteria_info[krit_id]['atribut'].lower()
            bobot = kriteria_info[krit_id]['bobot']
            pembagi = detail_moora["pembagi_euclidean"][krit_id]["hasil"]
            
            x_ij = nilai_asli / pembagi if pembagi != 0 else 0
            nilai_optimasi = x_ij * bobot
            
            detail_moora["normalisasi"][alt_id]["nilai"][krit_id] = {
                "rumus": f"{nilai_asli} / {round(pembagi, 4)}",
                "hasil": round(x_ij, 4)
            }
            
            detail_moora["terbobot"][alt_id]["nilai"][krit_id] = {
                "rumus": f"{round(x_ij, 4)} × {bobot}",
                "hasil": round(nilai_optimasi, 4)
            }
            
            if atribut == 'benefit':
                total_benefit += nilai_optimasi
            else:
                total_cost += nilai_optimasi
        
        nilai_akhir_moora = total_benefit - total_cost
        
        detail_moora["optimasi"][alt_id] = {
            "nama": alt.nama_karyawan,
            "total_benefit": round(total_benefit, 4),
            "total_cost": round(total_cost, 4),
            "perhitungan": f"{round(total_benefit, 4)} - {round(total_cost, 4)}",
            "nilai_akhir": round(nilai_akhir_moora, 4)
        }

    hasil_moora = sorted(
        [{"id_alternatif": alt_id, "nama_karyawan": data["nama"], "nilai_akhir": data["nilai_akhir"]} 
         for alt_id, data in detail_moora["optimasi"].items()],
        key=lambda x: x['nilai_akhir'], 
        reverse=True
    )

    return {
        "ranking_saw": hasil_saw,
        "ranking_moora": hasil_moora,
        "detail_perhitungan": {
            "saw": detail_saw,
            "moora": detail_moora,
            "kriteria_info": kriteria_info
        }
    }