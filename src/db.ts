import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { SenderProfile, LabelRecord } from './types';

interface ShippingDB extends DBSchema {
  sender: {
    key: number;
    value: SenderProfile;
  };
  labels: {
    key: number;
    value: LabelRecord;
    indexes: { 'by-time': number };
  };
}

let dbPromise: Promise<IDBPDatabase<ShippingDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<ShippingDB>('ShippingLabelDB', 1, {
      upgrade(db) {
        db.createObjectStore('sender', { keyPath: 'id' });
        const labelStore = db.createObjectStore('labels', {
          keyPath: 'id',
          autoIncrement: true,
        });
        labelStore.createIndex('by-time', 'timestamp');
      },
    });
  }
  return dbPromise;
};

export const getSenderProfile = async () => {
  const db = await initDB();
  return db.get('sender', 1);
};

export const saveSenderProfile = async (profile: Omit<SenderProfile, 'id'>) => {
  const db = await initDB();
  await db.put('sender', { ...profile, id: 1 });
};

export const saveLabel = async (label: Omit<LabelRecord, 'id' | 'timestamp'>) => {
  const db = await initDB();
  return db.add('labels', { ...label, timestamp: Date.now() });
};

export const getLabels = async (limit: number = 50) => {
  const db = await initDB();
  const tx = db.transaction('labels', 'readonly');
  const store = tx.objectStore('labels');
  const index = store.index('by-time');
  let cursor = await index.openCursor(null, 'prev');
  const labels: LabelRecord[] = [];
  while (cursor && labels.length < limit) {
    labels.push(cursor.value);
    cursor = await cursor.continue();
  }
  return labels;
};

export const deleteLabel = async (id: number) => {
  const db = await initDB();
  await db.delete('labels', id);
};
