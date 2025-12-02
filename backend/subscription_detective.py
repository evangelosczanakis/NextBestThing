from datetime import datetime, timedelta
from collections import defaultdict
import re

class SubscriptionDetective:
    def identify_recurring_payments(self, transactions):
        """
        Identifies recurring payments from a list of transactions using strict interval logic.
        
        Args:
            transactions: List of dicts {description, amount, date}
                          date can be string (YYYY-MM-DD or MM/DD/YYYY) or datetime object.
                          
        Returns:
            List of active subscriptions with details.
        """
        # Step 1: Normalize descriptions and Group
        # We use a dictionary to group transactions by their normalized name
        grouped_txs = defaultdict(list)
        
        for tx in transactions:
            original_desc = tx.get('description', tx.get('desc', ''))
            norm_name = self._normalize_description(original_desc)
            
            # Store the transaction with its parsed date
            parsed_date = self._parse_date(tx['date'])
            if parsed_date:
                grouped_txs[norm_name].append({
                    'original_desc': original_desc,
                    'amount': float(tx['amount']),
                    'date': parsed_date,
                    'original_obj': tx
                })

        subscriptions = []

        # Step 3: Calculate time delta between transactions
        for name, tx_list in grouped_txs.items():
            # Need at least 2 transactions to determine recurrence
            if len(tx_list) < 2:
                continue
                
            # Sort by date
            sorted_txs = sorted(tx_list, key=lambda x: x['date'])
            
            # Check for periodicity (approx 30 days)
            is_recurring = False
            intervals = []
            
            # We check consecutive transactions
            for i in range(len(sorted_txs) - 1):
                d1 = sorted_txs[i]['date']
                d2 = sorted_txs[i+1]['date']
                delta_days = (d2 - d1).days
                intervals.append(delta_days)
                
                # Check if delta is ~30 days (+/- 2 days)
                # We also allow for ~30 days multiples (e.g. missed a month? maybe not for now)
                # User spec: "If delta is ~30 days (+/- 2 days)"
                if 28 <= delta_days <= 32:
                    is_recurring = True
            
            # If we found at least one valid monthly interval, we consider it a candidate
            # We could be stricter and require ALL intervals to be valid, or a majority.
            # For "Robust", let's require that the *most recent* interval or the average interval fits.
            # Let's stick to the user's simple logic: "If delta is ~30 days... mark as Subscription"
            
            if is_recurring:
                # Calculate average amount
                amounts = [t['amount'] for t in sorted_txs]
                avg_amount = sum(amounts) / len(amounts)
                
                # Predict next due date
                last_date = sorted_txs[-1]['date']
                next_due = last_date + timedelta(days=30)
                
                subscriptions.append({
                    "name": name,
                    "amount": round(avg_amount, 2),
                    "frequency": "Monthly",
                    "next_due": next_due.strftime("%Y-%m-%d"),
                    "confidence": "High",
                    "details": f"Detected {len(sorted_txs)} transactions. Intervals: {intervals}"
                })
                
        return subscriptions

    def _normalize_description(self, desc):
        """
        Normalize descriptions by removing dates, codes, and common garbage.
        Example: "NFLX 1024" -> "NETFLIX" (if mapped) or "NFLX"
        """
        if not desc:
            return ""
            
        # 1. Convert to uppercase
        norm = desc.upper()
        
        # 2. Remove common date formats
        # MM/DD, MM/DD/YY, YYYY-MM-DD
        norm = re.sub(r'\d{1,2}[/-]\d{1,2}([/-]\d{2,4})?', '', norm)
        
        # 3. Remove long numeric sequences (often IDs)
        # Matches 4 or more digits
        norm = re.sub(r'\d{4,}', '', norm)
        
        # 4. Remove specific patterns like " #123" or " ID: 123"
        norm = re.sub(r'\s+[#]\d+', '', norm)
        norm = re.sub(r'\s+ID:?\s*\d+', '', norm)
        
        # 5. Remove common transaction noise
        noise_words = ["POS PURCHASE", "DEBIT CARD", "RECURRING", "PAYMENT", "AUTH", "VISA", "MC"]
        for word in noise_words:
            norm = norm.replace(word, "")
            
        # 6. Trim and collapse whitespace
        norm = re.sub(r'\s+', ' ', norm).strip()
        
        # 7. (Optional) Known mappings for cleaner names
        # This handles the "NFLX" -> "NETFLIX" case if desired
        mappings = {
            "NFLX": "NETFLIX",
            "SPOTIFY": "SPOTIFY",
            "AMZN": "AMAZON PRIME",
            "PRIME VIDEO": "AMAZON PRIME",
            "DISNEY+": "DISNEY PLUS",
            "D+:": "DISNEY PLUS"
        }
        
        # Check if the normalized string contains any of the keys (or is equal)
        # Simple exact match or startswith for now
        if norm in mappings:
            return mappings[norm]
            
        # Also check if any mapping key is a substring?
        # e.g. "NFLX.COM" -> "NETFLIX"
        for key, val in mappings.items():
            if key in norm:
                return val
                
        return norm

    def _parse_date(self, date_val):
        if isinstance(date_val, datetime):
            return date_val
        
        # Common string formats
        formats = [
            "%Y-%m-%d",      # 2023-12-01
            "%m/%d/%Y",      # 12/01/2023
            "%d-%m-%Y",      # 01-12-2023
            "%Y/%m/%d",      # 2023/12/01
            "%m-%d-%Y"       # 12-01-2023
        ]
        
        for fmt in formats:
            try:
                return datetime.strptime(str(date_val), fmt)
            except ValueError:
                continue
                
        return None

# Export singleton
subscription_detective = SubscriptionDetective()
