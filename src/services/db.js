import { createRxDatabase, addRxPlugin } from 'rxdb';
import { getRxStorageDexie } from 'rxdb/plugins/storage-dexie';
import { SupabaseReplication } from 'rxdb-supabase';
import { RxDBLeaderElectionPlugin } from 'rxdb/plugins/leader-election';
import { RxDBUpdatePlugin } from 'rxdb/plugins/update';
import { createClient } from '@supabase/supabase-js';

addRxPlugin(RxDBLeaderElectionPlugin);
addRxPlugin(RxDBUpdatePlugin);

const transactionSchema = {
    version: 0,
    primaryKey: 'id',
    type: 'object',
    properties: {
        id: {
            type: 'string',
            maxLength: 100
        },
        amount: {
            type: 'number'
        },
        merchant: {
            type: 'string'
        },
        category: {
            type: 'string'
        },
        type: {
            type: 'string',
            enum: ['expense', 'income']
        },
        date: {
            type: 'string',
            format: 'date-time'
        },
        updated_at: {
            type: 'string',
            format: 'date-time'
        },
        _deleted: {
            type: 'boolean'
        }
    },
    required: ['id', 'amount', 'type', 'date', 'updated_at']
};

let dbPromise = null;

const _create = async () => {
    console.log('DatabaseService: Creating database...');
    const db = await createRxDatabase({
        name: 'frugalflowdb',
        storage: getRxStorageDexie()
    });

    console.log('DatabaseService: Adding collections...');
    await db.addCollections({
        transactions: {
            schema: transactionSchema
        }
    });

    // Start replication if Supabase URL is available
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
        console.log('DatabaseService: Starting replication...');
        const supabaseClient = createClient(supabaseUrl, supabaseKey);

        const replication = new SupabaseReplication({
            supabaseClient,
            collection: db.transactions,
            replicationIdentifier: 'transactions-replication',
            pull: {
                realtimePostgresChanges: true,
                lastModifiedField: 'updated_at'
            },
            push: {
                // batchSize is not directly supported in the same way, but we can omit for default
            }
        });

        replication.error$.subscribe(err => {
            console.error('Replication error:', err);
        });
    } else {
        console.warn('DatabaseService: Supabase credentials not found. Replication disabled.');
    }

    return db;
};

export const getDatabase = () => {
    if (!dbPromise) {
        dbPromise = _create();
    }
    return dbPromise;
};
