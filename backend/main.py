from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
import uuid

DATABASE_URL = "postgresql://neondb_owner:npg_0YuNwC6jZWPO@ep-dawn-queen-anf44elz-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class ItemDB(Base):
    __tablename__ = "items"
    id = Column(String, primary_key=True, index=True)
    name = Column(String)
    buyPrice = Column(Float)
    sellPrice = Column(Float, nullable=True)
    status = Column(String, default="IN_STOCK")


Base.metadata.create_all(bind=engine)


app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ItemCreate(BaseModel):
    name: str
    buyPrice: float

class ItemSell(BaseModel):
    sellPrice: float

class ItemOut(BaseModel):
    id: str
    name: str
    buyPrice: float
    sellPrice: Optional[float]
    status: str
    class Config:
        orm_mode = True


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/items", response_model=List[ItemOut])
def get_items(db: Session = Depends(get_db)):
    return db.query(ItemDB).all()

@app.post("/items", response_model=ItemOut)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    new_item = ItemDB(
        id=str(uuid.uuid4()),
        name=item.name,
        buyPrice=item.buyPrice,
        status="IN_STOCK"
    )
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@app.put("/items/{item_id}/sell", response_model=ItemOut)
def sell_item(item_id: str, item: ItemSell, db: Session = Depends(get_db)):
    db_item = db.query(ItemDB).filter(ItemDB.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db_item.sellPrice = item.sellPrice
    db_item.status = "SOLD"
    db.commit()
    db.refresh(db_item)
    return db_item

@app.delete("/items/sold")
def clear_sold_items(db: Session = Depends(get_db)):
    # This targets only items with the "SOLD" status
    db.query(ItemDB).filter(ItemDB.status == "SOLD").delete()
    db.commit()
    return {"message": "History cleared"}