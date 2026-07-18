from sqlalchemy import Column, String, Integer, JSON
import uuid
from database import Base, engine

class Order(Base):
    __tablename__ = "orders"
    __table_args__ = {'extend_existing': True}  # <-- This fixes the crash!

    order_id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    token_number = Column(Integer, index=True)
    student_name = Column(String)
    total_amount = Column(Integer)
    status = Column(String, default="New") 
    items = Column(JSON) 

# This automatically builds your tables
Base.metadata.create_all(bind=engine)
