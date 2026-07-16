from fastapi import FastAPI, HTTPException, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import uuid
import json

from database import engine, SessionLocal, Base, Student, Order
from sqlalchemy.orm import Session

# This line magically creates your database file when the server starts!
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Campus Canteen Core Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get a database session for every API call
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class OrderItem(BaseModel):
    name: str
    qty: int
    price: int

class PlaceOrderRequest(BaseModel):
    student_id: str
    items: List[OrderItem]

class UpdateStatusRequest(BaseModel):
    status: str

# Seed the database with your student profile if it's not there yet
# NEW: Import the MenuItem table at the top of main.py
from database import engine, SessionLocal, Base, Student, Order, MenuItem

# Upgrade the seed function to load the menu!
def seed_test_data():
    db = SessionLocal()
    
    # 1. Seed Student
    if not db.query(Student).filter(Student.student_id == "STU-2026-01").first():
        test_student = Student(student_id="STU-2026-01", name="Adhithya N", balance=750)
        db.add(test_student)
    
    # 2. Seed Initial Menu
    if not db.query(MenuItem).first():
        sample_menu = [
            MenuItem(item_id="M1", name="Masala Dosa", price=50, category="Breakfast", stock_count=45, is_special=1, time_slot="Morning", image_url="https://images.unsplash.com/photo-1630409351241-193952f418d1?w=500&auto=format&fit=crop&q=60"),
            MenuItem(item_id="M2", name="Veg Meals", price=80, category="Lunch", stock_count=100, is_special=0, time_slot="Afternoon", image_url="https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=500&auto=format&fit=crop&q=60"),
            MenuItem(item_id="M3", name="Samosa (2 pcs)", price=30, category="Snacks", stock_count=5, is_special=0, time_slot="All", image_url="https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&auto=format&fit=crop&q=60"),
            MenuItem(item_id="M4", name="Filter Coffee", price=20, category="Hot Drinks", stock_count=2, is_special=0, time_slot="All", image_url="https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?w=500&auto=format&fit=crop&q=60")
        ]
        db.add_all(sample_menu)
    
    db.commit()
    db.close()

seed_test_data()

# --- DATABASE API ROUTES ---

@app.get("/api/wallet/{student_id}")
async def get_wallet_balance(student_id: str, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student record not found")
    return {"student_id": student.student_id, "name": student.name, "balance": student.balance}

@app.get("/api/menu")
async def get_live_menu(db: Session = Depends(get_db)):
    """Returns the full menu with live stock counts and images"""
    items = db.query(MenuItem).all()
    
    # We format it cleanly for the React frontend
    return [{
        "id": item.item_id,
        "name": item.name,
        "price": item.price,
        "category": item.category,
        "stock_count": item.stock_count,
        "is_special": bool(item.is_special),
        "time_slot": item.time_slot,
        "image_url": item.image_url
    } for item in items]

class UpdateMenuRequest(BaseModel):
    image_url: str
    stock_count: int

@app.patch("/api/menu/{item_id}")
async def update_menu_item(item_id: str, payload: UpdateMenuRequest, db: Session = Depends(get_db)):
    """Allows admins to instantly update food images and stock counts"""
    item = db.query(MenuItem).filter(MenuItem.item_id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    item.image_url = payload.image_url
    item.stock_count = payload.stock_count
    db.commit()
    return {"message": "Success"}


@app.post("/api/orders/place")
async def place_order(payload: PlaceOrderRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.student_id == payload.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student profile unregistered")
        
    total_cost = sum(item.price * item.qty for item in payload.items)
    
    if student.balance < total_cost:
        raise HTTPException(status_code=400, detail="Insufficient wallet balance!")
        
    # 1. Deduct money
    student.balance -= total_cost
    
    # 2. Generate token number
    last_order = db.query(Order).order_by(Order.id.desc()).first()
    token_counter = last_order.token_number + 1 if last_order else 100
    
    # 3. Save to database
    new_order = Order(
        order_id=str(uuid.uuid4())[:8].upper(),
        token_number=token_counter,
        student_name=student.name,
        total_amount=total_cost,
        status="New",
        items=json.dumps([f"{item.qty}x {item.name}" for item in payload.items])
    )
    db.add(new_order)
    db.commit()
    
    return {"order_id": new_order.order_id, "token_number": new_order.token_number}

@app.get("/api/kitchen/queue")
async def get_kitchen_queue(db: Session = Depends(get_db)):
    # Only show orders that are New or Cooking in the kitchen
    orders = db.query(Order).filter(Order.status.in_(["New", "Cooking"])).all()
    
    result = []
    for o in orders:
        result.append({
            "order_id": o.order_id,
            "token_number": o.token_number,
            "student_name": o.student_name,
            "total_amount": o.total_amount,
            "status": o.status,
            "items": json.loads(o.items)
        })
    return result

@app.patch("/api/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: UpdateStatusRequest, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
        
    order.status = payload.status
    db.commit()
    return {"message": "Success", "new_status": order.status}

@app.get("/api/display/board")
async def get_display_board(db: Session = Depends(get_db)):
    """Public API for the TV screen to show students their token status"""
    orders = db.query(Order).filter(Order.status.in_(["Cooking", "Ready"])).all()
    
    return [{"token_number": o.token_number, "status": o.status} for o in orders]
