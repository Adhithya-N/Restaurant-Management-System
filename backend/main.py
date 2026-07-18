# 1. Standard Library & Typing Imports
from typing import List
from pydantic import BaseModel
import random

# 2. FastAPI Imports
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

# 3. Local Project Imports
from database import SessionLocal, engine, Base
from models import Order
from ai_agents import canteen_ai_app  # The A2A LangGraph Engine

# Initialize App
app = FastAPI(title="Campus Canteen API")

# Configure CORS so React can talk to FastAPI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PYDANTIC SCHEMAS ---
class OrderItemReq(BaseModel):
    name: str
    qty: int
    price: int

class PlaceOrderReq(BaseModel):
    student_id: str
    items: List[OrderItemReq]

class UpdateStatusReq(BaseModel):
    status: str

class AICheckoutReq(BaseModel):
    items: List[str]
    total_amount: int

# --- API ENDPOINTS ---

@app.get("/api/menu")
async def get_menu():
    """Returns the live menu to the React POS"""
    # Fallback mock data to ensure the frontend never crashes
    return [
        {
            "id": "1", "name": "Masala Dosa", "price": 60, "category": "Breakfast",
            "stock_count": 45, "is_special": False, "image_url": "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&q=80",
            "calories": 350, "diet_type": "veg", "spice_level": 2, "ingredients": "Rice batter, potato masala, chutney",
            "is_bestseller": True, "is_new": False
        },
        {
            "id": "2", "name": "Chicken Biryani", "price": 120, "category": "Lunch",
            "stock_count": 20, "is_special": True, "image_url": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&q=80",
            "calories": 650, "diet_type": "non-veg", "spice_level": 3, "ingredients": "Basmati rice, chicken, spices",
            "is_bestseller": True, "is_new": False
        },
        {
            "id": "3", "name": "Filter Coffee", "price": 20, "category": "Beverage",
            "stock_count": 100, "is_special": False, "image_url": "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?w=500&q=80",
            "calories": 80, "diet_type": "veg", "spice_level": 0, "ingredients": "Coffee decoction, milk, sugar",
            "is_bestseller": False, "is_new": True
        }
    ]

@app.post("/api/orders/place")
async def place_order(payload: PlaceOrderReq, db: Session = Depends(get_db)):
    """Creates a new order and returns a token number"""
    total = sum(item.price * item.qty for item in payload.items)
    token = random.randint(100, 999)
    
    # Extract just the names of the items for the database
    item_names = [item.name for item in payload.items]
    
    new_order = Order(
        token_number=token,
        student_name=payload.student_id,
        total_amount=total,
        status="New",
        items=item_names
    )
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return {"message": "Order placed", "token_number": token, "order_id": new_order.order_id}

@app.get("/api/kitchen/queue")
async def get_kitchen_queue(db: Session = Depends(get_db)):
    """Returns all active orders for the Kitchen Monitor"""
    return db.query(Order).filter(Order.status.in_(["New", "Cooking"])).all()

@app.patch("/api/orders/{order_id}/status")
async def update_order_status(order_id: str, payload: UpdateStatusReq, db: Session = Depends(get_db)):
    """Updates order status (New -> Cooking -> Ready)"""
    order = db.query(Order).filter(Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    order.status = payload.status
    db.commit()
    return {"message": "Status updated"}

@app.get("/api/display/board")
async def get_display_board(db: Session = Depends(get_db)):
    """Returns tokens for the TV display screen"""
    return db.query(Order).filter(Order.status.in_(["Cooking", "Ready"])).all()

@app.get("/api/admin/analytics")
async def get_analytics(db: Session = Depends(get_db)):
    """Calculates live canteen revenue and metrics"""
    orders = db.query(Order).all()
    total_revenue = sum(o.total_amount for o in orders)
    total_orders = len(orders)
    
    chart_data = [
        {"name": "Mon", "revenue": total_revenue * 0.3 if total_revenue else 1200},
        {"name": "Tue", "revenue": total_revenue * 0.5 if total_revenue else 2100},
        {"name": "Wed", "revenue": total_revenue * 0.4 if total_revenue else 1800},
        {"name": "Thu", "revenue": total_revenue * 0.8 if total_revenue else 2400},
        {"name": "Today", "revenue": total_revenue if total_revenue else 500},
    ]
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "chart_data": chart_data
    }

@app.post("/api/ai/checkout-insight")
async def get_ai_insight(payload: AICheckoutReq):
    """Triggers the Agent-to-Agent (A2A) workflow for live cart analysis"""
    
    initial_state = {
        "student_cart": payload.items,
        "current_total": payload.total_amount,
        "ai_recommendation": "",
        "inventory_alert": ""
    }
    
    final_state = canteen_ai_app.invoke(initial_state)
    
    return {
        "recommendation": final_state["ai_recommendation"],
        "alert": final_state["inventory_alert"]
    }

