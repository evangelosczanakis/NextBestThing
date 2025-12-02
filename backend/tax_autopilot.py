class TaxAutopilot:
    def __init__(self):
        # MVP: Flat rate for now, but could be expanded by state
        self.DEFAULT_RATE = 0.20
        self.GIG_PLATFORMS = [
            "UBER", "LYFT", "DOORDASH", "GRUBHUB", "INSTACART", 
            "FIVERR", "UPWORK", "TASKRABBIT", "POSTMATES", "AMAZON FLEX"
        ]

    def calculate_gig_tax(self, transaction, state="NJ"):
        """
        Calculates the estimated tax withholding for a gig economy transaction.
        
        Args:
            transaction (dict): The transaction object containing 'amount', 'description', and 'type'/'direction'.
            state (str): The state code (e.g., "NJ"). Currently uses a flat rate for MVP.
            
        Returns:
            float: The estimated tax withholding amount. Returns 0.0 if not a gig income transaction.
        """
        # Step 1: Identify if transaction is Income
        # Check direction/type or if amount is positive (assuming positive = income in some contexts, 
        # but usually 'amount' is absolute and 'direction' tells us).
        is_income = False
        if transaction.get('direction') == 'INCOME':
            is_income = True
        elif transaction.get('amount', 0) > 0 and transaction.get('type') == 'credit': 
            # Fallback if direction not set but type implies it
            is_income = True
            
        if not is_income:
            return 0.0

        # Step 1b: Identify if Source is Gig
        description = transaction.get('description', '').upper()
        is_gig = any(platform in description for platform in self.GIG_PLATFORMS)
        
        if not is_gig:
            return 0.0

        # Step 2: Apply safe estimate (20% flat rate for MVP)
        # In a real app, we'd lookup state tax brackets + self-employment tax (15.3%) + federal.
        # 20-30% is usually the safe rule of thumb. User requested 20%.
        
        tax_rate = self.DEFAULT_RATE
        
        # Placeholder for state-specific logic
        if state == "CA":
            tax_rate += 0.05 # Example: Higher tax for CA
        elif state == "NY":
            tax_rate += 0.04
            
        amount = float(transaction.get('amount', 0))
        withholding_amount = amount * tax_rate
        
        return round(withholding_amount, 2)

# Export singleton
tax_autopilot = TaxAutopilot()
