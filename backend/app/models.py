from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Kriteria(Base):
    __tablename__ = "kriteria"
    id_kriteria = Column(String, primary_key=True, index=True)
    nama_kriteria = Column(String)
    bobot = Column(Float)
    atribut = Column(String)

    penilaian = relationship("Penilaian", back_populates="kriteria", cascade="all, delete-orphan")

class Alternatif(Base):
    __tablename__ = "alternatif"
    id_alternatif = Column(String, primary_key=True, index=True)
    nama_karyawan = Column(String)

    penilaian = relationship("Penilaian", back_populates="alternatif", cascade="all, delete-orphan")

class Penilaian(Base):
    __tablename__ = "penilaian"
    id_penilaian = Column(Integer, primary_key=True, index=True)
    id_alternatif = Column(String, ForeignKey("alternatif.id_alternatif"))
    id_kriteria = Column(String, ForeignKey("kriteria.id_kriteria"))
    nilai_performa = Column(Float)

    alternatif = relationship("Alternatif", back_populates="penilaian")
    kriteria = relationship("Kriteria", back_populates="penilaian")