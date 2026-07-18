from sqlalchemy import create_engine, Column, Integer, String, Text
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker

# This creates a local file called 'canteen.db' to store everything
SQLALCHEMY_DATABASE_URL = "sqlite:///./canteen_v3.db"


engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(String, unique=True, index=True)
    name = Column(String)
    balance = Column(Integer)

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(String, unique=True, index=True)
    token_number = Column(Integer)
    student_name = Column(String)
    total_amount = Column(Integer)
    status = Column(String)
    items = Column(Text)

# 3. The Live Menu Table
class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(String, unique=True, index=True)
    name = Column(String)
    price = Column(Integer)
    category = Column(String)       
    stock_count = Column(Integer)   
    image_url = Column(String)      
    is_special = Column(Integer, default=0) 
    time_slot = Column(String)      
    
    # NEW: High-End UI Data Points
    calories = Column(Integer, default=0)
    diet_type = Column(String, default="Veg")  # "Veg", "Non-Veg", or "Vegan"
    spice_level = Column(Integer, default=1)   # Scale of 1 to 3
    ingredients = Column(String, default="")   # Comma-separated list
    is_bestseller = Column(Integer, default=0)
    is_new = Column(Integer, default=0)