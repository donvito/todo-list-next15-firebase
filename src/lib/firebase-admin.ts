import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const serviceAccount = require('../config/serviceAccountKey.json');

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://boltdemo-ea42f-default-rtdb.firebaseio.com"
  });
}

export const adminDb = admin.firestore();
export const adminAuth = admin.auth();
