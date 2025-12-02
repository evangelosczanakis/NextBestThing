def tag_transaction(description, amount):
    """
    Tags a transaction based on description keywords and amount.
    
    Args:
        description (str): The transaction description.
        amount (float): The transaction amount.
        
    Returns:
        str: The category tag.
    """
    if not description:
        return "Uncategorized"
        
    description_upper = description.upper()
    
    # Rule 1: Gig Income
    # If desc contains "Wal-Mart Assocs" or "Venmo" AND amount > 0 -> Tag "Income/Gig"
    if amount > 0 and any(keyword in description_upper for keyword in ["WAL-MART ASSOCS", "VENMO"]):
        return "Income/Gig"
        
    # Rule 2: Gambling/Risk
    # If desc contains "FD SPTSBK", "CASINO", "FanDuel", "DraftKings" -> Tag "Discretionary/Risk"
    if any(keyword in description_upper for keyword in ["FD SPTSBK", "CASINO", "FANDUEL", "DRAFTKINGS"]):
        return "Discretionary/Risk"
        
    # Rule 3: Bills
    # If desc contains "CRUNCH FIT", "AMEX EPAYMENT" -> Tag "Subscription/Bill"
    if any(keyword in description_upper for keyword in ["CRUNCH FIT", "AMEX EPAYMENT"]):
        return "Subscription/Bill"
        
    # Rule 4: Education
    # If desc contains "PSU" or "Tuition" -> Tag "Education"
    if any(keyword in description_upper for keyword in ["PSU", "TUITION"]):
        return "Education"
        
    return "Uncategorized"
