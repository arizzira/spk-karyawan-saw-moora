from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware

import models
import schemas
import saw_moora
from database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="API SPK Karyawan - SAW & MOORA",
    description="Backend untuk Sistem Pendukung Keputusan Pemilihan Karyawan",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Server API SPK Karyawan Berjalan Normal!"}

@app.get("/api/kriteria", response_model=List[schemas.Kriteria])
def get_kriteria(db: Session = Depends(get_db)):
    return db.query(models.Kriteria).all()

@app.post("/api/kriteria", response_model=schemas.Kriteria, status_code=status.HTTP_201_CREATED)
def create_kriteria(kriteria: schemas.KriteriaCreate, db: Session = Depends(get_db)):
    cek = db.query(models.Kriteria).filter(models.Kriteria.id_kriteria == kriteria.id_kriteria).first()
    if cek:
        raise HTTPException(status_code=400, detail="ID Kriteria sudah terdaftar")
    
    db_kriteria = models.Kriteria(**kriteria.model_dump())
    db.add(db_kriteria)
    db.commit()
    db.refresh(db_kriteria)
    return db_kriteria

@app.get("/api/alternatif", response_model=List[schemas.Alternatif])
def get_alternatif(db: Session = Depends(get_db)):
    return db.query(models.Alternatif).all()

@app.post("/api/alternatif", response_model=schemas.Alternatif, status_code=status.HTTP_201_CREATED)
def create_alternatif(alternatif: schemas.AlternatifCreate, db: Session = Depends(get_db)):
    cek = db.query(models.Alternatif).filter(models.Alternatif.id_alternatif == alternatif.id_alternatif).first()
    if cek:
        raise HTTPException(status_code=400, detail="ID Alternatif sudah terdaftar")
    
    db_alternatif = models.Alternatif(**alternatif.model_dump())
    db.add(db_alternatif)
    db.commit()
    db.refresh(db_alternatif)
    return db_alternatif

@app.get("/api/penilaian", response_model=List[schemas.Penilaian])
def get_penilaian(db: Session = Depends(get_db)):
    return db.query(models.Penilaian).all()

@app.post("/api/penilaian", response_model=schemas.Penilaian, status_code=status.HTTP_201_CREATED)
def create_penilaian(penilaian: schemas.PenilaianCreate, db: Session = Depends(get_db)):
    if not db.query(models.Alternatif).filter(models.Alternatif.id_alternatif == penilaian.id_alternatif).first():
        raise HTTPException(status_code=404, detail="ID Alternatif tidak ditemukan")
    if not db.query(models.Kriteria).filter(models.Kriteria.id_kriteria == penilaian.id_kriteria).first():
        raise HTTPException(status_code=404, detail="ID Kriteria tidak ditemukan")

    db_penilaian = models.Penilaian(**penilaian.model_dump())
    db.add(db_penilaian)
    db.commit()
    db.refresh(db_penilaian)
    return db_penilaian

@app.get("/api/calculate")
def calculate_spk(db: Session = Depends(get_db)):
    hasil = saw_moora.calculate_all(db)
    if "error" in hasil:
        raise HTTPException(status_code=400, detail=hasil["error"])
    return hasil

@app.delete("/api/kriteria/{id_kriteria}")
def delete_kriteria(id_kriteria: str, db: Session = Depends(get_db)):
    db_kriteria = db.query(models.Kriteria).filter(models.Kriteria.id_kriteria == id_kriteria).first()
    if not db_kriteria:
        raise HTTPException(status_code=404, detail="Kriteria tidak ditemukan")
    db.delete(db_kriteria)
    db.commit()
    return {"message": "Kriteria berhasil dihapus"}

@app.delete("/api/alternatif/{id_alternatif}")
def delete_alternatif(id_alternatif: str, db: Session = Depends(get_db)):
    db_alt = db.query(models.Alternatif).filter(models.Alternatif.id_alternatif == id_alternatif).first()
    if not db_alt:
        raise HTTPException(status_code=404, detail="Alternatif tidak ditemukan")
    db.delete(db_alt)
    db.commit()
    return {"message": "Alternatif berhasil dihapus"}

@app.delete("/api/penilaian/{id_penilaian}")
def delete_penilaian(id_penilaian: int, db: Session = Depends(get_db)):
    db_penilaian = db.query(models.Penilaian).filter(models.Penilaian.id_penilaian == id_penilaian).first()
    if not db_penilaian:
        raise HTTPException(status_code=404, detail="Data penilaian tidak ditemukan")
    db.delete(db_penilaian)
    db.commit()
    return {"message": "Penilaian berhasil dihapus"}

@app.put("/api/penilaian/{id_penilaian}", response_model=schemas.Penilaian)
def update_penilaian(id_penilaian: int, penilaian_update: schemas.PenilaianUpdate, db: Session = Depends(get_db)):
    db_penilaian = db.query(models.Penilaian).filter(models.Penilaian.id_penilaian == id_penilaian).first()
    if not db_penilaian:
        raise HTTPException(status_code=404, detail="Data penilaian tidak ditemukan")
    
    update_data = penilaian_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_penilaian, key, value)
    
    db.commit()
    db.refresh(db_penilaian)
    return db_penilaian