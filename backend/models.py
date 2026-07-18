from sqlalchemy import Column, String, Integer, JSON
import uuid
from database import Base, engine

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'extend_existing': True}  # Keeps FastAPI happy on reload

    # Removed index=True to keep SQLite happy!
    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    token_number = Column(Integer)
    student_name = Column(String)
    total_amount = Column(Integer)
    status = Column(String, default="New") 
    items = Column(JSON) 

class MenuItem(Base):
    __tablename__ = "menu_items"
    __table_args__ = {'extend_existing': True}

    id = Column(Integer, primary_key=True)
    name = Column(String)
    price = Column(Integer)
    category = Column(String)
    image = Column(String) 
    description = Column(String)

# Rebuilds the tables safely
Base.metadata.create_all(bind=engine)