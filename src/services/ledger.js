import { getDatabase } from './db';
import { v4 as uuidv4 } from 'uuid';
import { BehaviorSubject } from 'rxjs';

class TransactionService {
    constructor() {
        this.balance$ = new BehaviorSubject(0);
        this.init();
    }

    async init() {
        const db = await getDatabase();

        // Subscribe to changes to update balance
        db.transactions.find().$.subscribe(transactions => {
            const total = transactions.reduce((acc, t) => {
                if (t.type === 'income') {
                    return acc + t.amount;
                } else {
                    return acc - t.amount;
                }
            }, 0);
            this.balance$.next(total);
        });
    }

    async addTransaction(data) {
        const db = await getDatabase();

        const transaction = {
            id: uuidv4(),
            amount: parseFloat(data.amount),
            merchant: data.merchant || 'Unknown',
            category: data.category || 'Uncategorized',
            type: data.type || 'expense',
            date: data.date || new Date().toISOString(),
            updated_at: new Date().toISOString(),
            _deleted: false
        };

        // Basic validation
        if (isNaN(transaction.amount)) {
            throw new Error('Invalid amount');
        }

        await db.transactions.insert(transaction);
        return transaction;
    }

    getBalance() {
        return this.balance$.asObservable();
    }
}

export const ledger = new TransactionService();
