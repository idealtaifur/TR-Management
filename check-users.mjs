import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as fs from 'fs';

// Read config to get project ID
let config;
try {
  config = JSON.parse(fs.readFileSync('./firebase-applet-config.json', 'utf8'));
} catch (e) {
  console.log("No config found");
  process.exit(1);
}

initializeApp({
  projectId: config.projectId,
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

async function queryUsers() {
  try {
    const users = await db.collection('users').get();
    console.log("Found users: " + users.size);
    users.forEach(doc => {
      console.log(doc.id, "=>", doc.data());
    });
  } catch (err) {
    console.error("Error querying users collection", err);
  }
}

queryUsers();
