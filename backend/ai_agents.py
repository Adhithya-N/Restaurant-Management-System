import os
from typing import TypedDict, List
from langgraph.graph import StateGraph, END

# Define the state that gets passed between our agents
class CanteenState(TypedDict):
    student_cart: List[str]
    current_total: int
    ai_recommendation: str
    inventory_alert: str

def recommendation_node(state: CanteenState):
    """Agent 1: Analyzes the cart and suggests an upsell combo"""
    cart = state["student_cart"]
    
    suggestion = "No recommendation"
    if "Masala Dosa" in cart:
        suggestion = "Filter Coffee (Perfect Combo!)"
    elif "Chicken Biryani" in cart:
        suggestion = "Extra Raita & Samosa"
        
    return {"ai_recommendation": suggestion}

def forecasting_node(state: CanteenState):
    """Agent 2: Analyzes order value to predict kitchen inventory needs"""
    total = state["current_total"]
    
    alert = "Stock levels normal"
    if total > 500:
        alert = "High volume detected! Prep extra ingredients for tomorrow."
        
    return {"inventory_alert": alert}

# Build the Agent to Agent routing graph
workflow = StateGraph(CanteenState)

workflow.add_node("recommender", recommendation_node)
workflow.add_node("forecaster", forecasting_node)

workflow.set_entry_point("recommender")
workflow.add_edge("recommender", "forecaster")
workflow.add_edge("forecaster", END)

# Compile the graph into an executable application
canteen_ai_app = workflow.compile()
