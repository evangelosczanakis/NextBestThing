from datetime import datetime
from collections import defaultdict
from thefuzz import fuzz, process
import re

class SubscriptionScanner:
    RECURRING_KEYWORDS = ["PPD", "REC", "Club Fees", "Mbrshp", "Subscription", "Auto-Pay"]
    
    def scan(self, transactions):
        """
        Scans a list of transactions for potential subscriptions.
        
        Args:
            transactions: List of dicts {date, description, amount}
            
        Returns:
            List of "Suspected Subscriptions" with confidence scores.
        """
        # Helper to normalize transaction keys
        normalized_txs = []
        for t in transactions:
            desc = t.get('description', t.get('desc', ''))
            normalized_txs.append({
                'date': t['date'],
                'amount': t['amount'],
                'description': desc,
                'clean_desc': self._clean_description(desc),
                'original_obj': t
            })

        candidates = {} # Key: (clean_desc, amount), Value: candidate_obj

        # Step 2: Group transactions using token set ratio > 80
        # We'll group by comparing clean descriptions
        groups = []
        
        # Optimization: Sort by clean_desc to minimize comparisons? 
        # Or just simple O(N^2) for small datasets (typical bank statement is < 200 lines)
        
        processed_indices = set()
        
        for i, tx in enumerate(normalized_txs):
            if i in processed_indices:
                continue
                
            current_group = [tx]
            processed_indices.add(i)
            
            for j, other_tx in enumerate(normalized_txs):
                if j in processed_indices:
                    continue
                
                # Fuzzy match
                ratio = fuzz.token_set_ratio(tx['clean_desc'], other_tx['clean_desc'])
                if ratio > 80:
                    current_group.append(other_tx)
                    processed_indices.add(j)
            
            groups.append(current_group)

        # Step 3: Check Intervals
        for group in groups:
            # Sort by date
            parsed_group = []
            for item in group:
                dt = self._parse_date(item['date'])
                if dt:
                    parsed_group.append({**item, 'dt': dt})
            
            parsed_group.sort(key=lambda x: x['dt'])
            
            # Check for periodicity
            if len(parsed_group) > 1:
                for k in range(len(parsed_group) - 1):
                    current = parsed_group[k]
                    next_item = parsed_group[k+1]
                    
                    delta = next_item['dt'] - current['dt']
                    days = abs(delta.days)
                    
                    # 28-31 days apart -> High Confidence
                    if 28 <= days <= 31:
                        self._add_candidate(candidates, current, "High", "Periodicity Detected (Monthly)")
            
            # Step 4: Keyword Backup
            # Check each item in group (or just the representative)
            for item in group:
                for keyword in self.RECURRING_KEYWORDS:
                    if keyword.lower() in item['description'].lower():
                        # Mark as Medium if not already High
                        self._add_candidate(candidates, item, "Medium", f"Keyword Match: {keyword}")

        return list(candidates.values())

    def _clean_description(self, desc):
        """
        Removes dates, long IDs, but keeps merchant names.
        """
        # Remove dates like MM/DD or MM/DD/YY
        desc = re.sub(r'\d{1,2}/\d{1,2}(/\d{2,4})?', '', desc)
        
        # Remove long numeric sequences (IDs)
        desc = re.sub(r'\d{5,}', '', desc)
        
        # Remove common prefixes
        desc = desc.replace("Debit Card Purchase", "").replace("Direct Deposit -", "")
        
        return desc.strip()

    def _parse_date(self, date_str):
        try:
            if '-' in date_str:
                return datetime.strptime(date_str, "%Y-%m-%d")
            else:
                return datetime.strptime(date_str, "%m/%d/%Y")
        except ValueError:
            return None

    def _add_candidate(self, candidates, tx, confidence, reason):
        key = (tx['clean_desc'], tx['amount'])
        
        # Logic to upgrade confidence
        if key in candidates:
            existing = candidates[key]
            if confidence == "High" and existing['confidence'] != "High":
                existing['confidence'] = "High"
                existing['reason'] = reason
        else:
            candidates[key] = {
                "merchant": tx['clean_desc'], # Use clean desc as merchant name
                "amount": tx['amount'],
                "confidence": confidence,
                "reason": reason,
                "detected_date": tx['date']
            }

# Wrapper for backward compatibility
def detect_recurring(transactions):
    scanner = SubscriptionScanner()
    return scanner.scan(transactions)
