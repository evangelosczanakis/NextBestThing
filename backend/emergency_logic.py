import json
from typing import Dict, List, Any

def calculate_emergency_fund_release(
    available_balance: float,
    needs_allocation: float,
    wants_allocation: float,
    target_emergency_amount: float
) -> Dict[str, Any]:
    """
    Calculates how to reallocate funds to meet a target emergency amount.
    
    Logic:
    1. Check if "Wants" > 0. If so, drain "Wants" first.
    2. If insufficient, identify "Flexible Needs" (mocked for now as we don't have granular needs data passed in yet, 
       but assuming 'needs_allocation' is a lump sum, we might just take from it or return a message).
       *Refining logic based on prompt*: "Identify 'Flexible Needs' (like Grocery budget vs Rent budget)."
       Since the input is just 'needs_allocation' (float), I will assume we might need to simulate breaking it down 
       or just take from the lump sum if wants are not enough.
    
    Returns a JSON plan with source, amount_taken, new_balance, and gig suggestions.
    """
    
    plan_steps = []
    current_raised = 0.0
    remaining_target = target_emergency_amount
    
    # Step 1: Drain Wants
    if wants_allocation > 0:
        amount_from_wants = min(wants_allocation, remaining_target)
        current_raised += amount_from_wants
        remaining_target -= amount_from_wants
        
        plan_steps.append({
            "step": 1,
            "source": "Wants (Dining Out, Entertainment)",
            "amount_taken": round(amount_from_wants, 2),
            "new_balance": round(wants_allocation - amount_from_wants, 2),
            "description": "Draining non-essential 'Wants' budget first."
        })

    # Step 2: Check Needs if still insufficient
    if remaining_target > 0 and needs_allocation > 0:
        # In a real scenario, we'd have a breakdown of needs. 
        # For now, we'll treat 'needs_allocation' as containing some flexible parts.
        # Let's assume 20% of needs are "flexible" (e.g. cheaper groceries).
        flexible_needs_cap = needs_allocation * 0.20 
        
        amount_from_needs = min(flexible_needs_cap, remaining_target)
        
        if amount_from_needs > 0:
            current_raised += amount_from_needs
            remaining_target -= amount_from_needs
            
            plan_steps.append({
                "step": 2,
                "source": "Flexible Needs (Groceries, Subscriptions)",
                "amount_taken": round(amount_from_needs, 2),
                "new_balance": round(needs_allocation - amount_from_needs, 2),
                "description": "Reducing flexible portions of 'Needs' (e.g., switching to generic brands)."
            })
    
    # Step 3: Gig Suggestions (Mock Data)
    # Based on location (mocked)
    gig_suggestions = [
        {
            "id": 1,
            "type": "DoorDash",
            "description": "3 DoorDash runs near you",
            "estimated_earnings": 45.00,
            "location": "Within 2 miles"
        },
        {
            "id": 2,
            "type": "TaskRabbit",
            "description": "Assemble IKEA furniture",
            "estimated_earnings": 60.00,
            "location": "Downtown"
        },
        {
            "id": 3,
            "type": "Sell",
            "description": "Sell old electronics on Marketplace",
            "estimated_earnings": 100.00,
            "location": "Online"
        }
    ]

    return {
        "status": "success" if remaining_target <= 0 else "partial_success",
        "target_amount": target_emergency_amount,
        "total_raised": round(current_raised, 2),
        "remaining_needed": round(remaining_target, 2),
        "plan": plan_steps,
        "gig_suggestions": gig_suggestions
    }
