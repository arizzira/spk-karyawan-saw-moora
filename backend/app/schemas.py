from pydantic import BaseModel
from typing import List, Optional

class KriteriaBase(BaseModel):
    id_kriteria: str
    nama_kriteria: str
    bobot: float
    atribut: str

class KriteriaCreate(KriteriaBase):
    pass

class KriteriaUpdate(BaseModel):
    nama_kriteria: Optional[str] = None
    bobot: Optional[float] = None
    atribut: Optional[str] = None

class Kriteria(KriteriaBase):
    class Config:
        from_attributes = True

class AlternatifBase(BaseModel):
    id_alternatif: str
    nama_karyawan: str

class AlternatifCreate(AlternatifBase):
    pass

class AlternatifUpdate(BaseModel):
    nama_karyawan: Optional[str] = None

class Alternatif(AlternatifBase):
    class Config:
        from_attributes = True

class PenilaianBase(BaseModel):
    id_alternatif: str
    id_kriteria: str
    nilai_performa: float

class PenilaianCreate(PenilaianBase):
    pass

class PenilaianUpdate(BaseModel):
    nilai_performa: Optional[float] = None

class Penilaian(PenilaianBase):
    id_penilaian: int
    
    class Config:
        from_attributes = True