from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import random

from database import SessionLocal
from models import MenuItem, Order

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Schemas ---
class OrderCreate(BaseModel):
    student_name: str
    total_amount: int
    items: List[str]

class MenuCreate(BaseModel):
    name: str
    price: int
    category: str
    image: str
    description: str

class CartPayload(BaseModel):
    items: List[str]
    total: int

class StatusUpdate(BaseModel):
    status: str

# --- API ENDPOINTS ---

@app.post("/api/orders")
def create_order(order: OrderCreate, db = Depends(get_db)):
    token = random.randint(100, 999)
    new_order = Order(
        token_number=token,
        student_name=order.student_name,
        total_amount=order.total_amount,
        items=order.items,
        status="New"
    )
    db.add(new_order)
    db.commit()
    return {"message": "Order placed", "token": token}

@app.post("/api/checkout/analyze")
def analyze_checkout(payload: CartPayload):
    return {
        "recommendation": "Recommender Agent: Enjoy your meal!",
        "alert": "Forecaster Agent: High volume detected."
    }

@app.get("/api/kitchen/queue")
def get_kitchen_queue(db = Depends(get_db)):
    return db.query(Order).filter(Order.status.in_(["New", "Cooking"])).all()

@app.patch("/api/kitchen/orders/{order_id}/status")
def update_order_status(order_id: str, payload: StatusUpdate, db = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order: raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    return {"message": "Status updated"}

@app.get("/api/admin/menu")
def get_menu(db = Depends(get_db)):
    return db.query(MenuItem).all()

@app.post("/api/admin/menu/add")
def add_menu_item(item: MenuCreate, db = Depends(get_db)):
    db_item = MenuItem(**item.dict())
    db.add(db_item)
    db.commit()
    return {"message": "Item added"}

@app.get("/api/admin/analytics")
def get_analytics(db = Depends(get_db)):
    orders = db.query(Order).all()
    return {"total_revenue": sum(o.total_amount for o in orders), "total_orders": len(orders)}