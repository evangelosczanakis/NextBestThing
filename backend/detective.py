from datetime import datetime, timedelta
from collections import defaultdict

def parse_date(date_str):
    """
    Parses MM/DD date string. Assumes current year for simplicity in prototype.
    """
    try:
        current_year = datetime.now().year
        return datetime.strptime(f"{date_str}/{current_year}", "%m/%d/%Y")
    except ValueError:
        return None

def detect_recurring(transactions):
    """
    Detects recurring transactions (potential subscriptions).
    Criteria:
    - Same merchant
    - Same amount
    - Interval approx 30 days (25-35 days)
    - At least 2 occurrences
    """
    merchant_groups = defaultdict(list)
    
    # Group by merchant
    for t in transactions:
        merchant_groups[t['merchant']].append(t)
        
    recurring_items = []
    
    for merchant, items in merchant_groups.items():
        if len(items) < 2:
            continue
            
        # Sort by date
        # We need to handle the date parsing carefully. 
        # If parsing fails, we skip.
        parsed_items = []
        for item in items:
            dt = parse_date(item['date'])
            if dt:
                parsed_items.append({**item, 'dt': dt})
        
        parsed_items.sort(key=lambda x: x['dt'])
        
        # Check intervals
        for i in range(len(parsed_items) - 1):
            current = parsed_items[i]
            next_item = parsed_items[i+1]
            
            # Check amount equality
            if current['amount'] != next_item['amount']:
                continue
                
            # Check time delta
            delta = next_item['dt'] - current['dt']
            days = delta.days
            
            # Allow for some variance (e.g., 28-32 days, or monthly)
            # Broadening to 25-35 to catch slightly irregular billing
            if 25 <= days <= 35:
                # Check if we already added this merchant/amount combo
                exists = False
                for existing in recurring_items:
                    if existing['merchant'] == merchant and existing['amount'] == current['amount']:
                        exists = True
                        break
                
                if not exists:
                    recurring_items.append({
                        "merchant": merchant,
                        "amount": current['amount'],
                        "frequency": "Monthly",
                        "detected_date": current['date']
                    })
                    
    return recurring_items
