
const admin = require('firebase-admin');
const { Firestore } = require('@google-cloud/firestore');

// Conectar ao emulador explicitamente
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.GCLOUD_PROJECT = 'broadcast-saas-dev';

admin.initializeApp({
  projectId: 'broadcast-saas-dev'
});

const db = admin.firestore();

async function check() {
  console.log('--- DIAGNÓSTICO DE MENSAGENS AGENDADAS ---');
  console.log('Hora local do sistema (Node):', new Date().toString());
  console.log('Hora local ISO:', new Date().toISOString());

  const snapshot = await db.collection('messages').where('status', '==', 'scheduled').get();
  
  console.log(`Encontradas ${snapshot.size} mensagens agendadas.`);
  
  snapshot.forEach(doc => {
    const data = doc.data();
    const scheduledAt = data.scheduledAt.toDate();
    const now = new Date();
    const diffMinutes = (now - scheduledAt) / 60000;
    
    console.log(`\nID: ${doc.id}`);
    console.log(`- ScheduledAt (Objeto):`, data.scheduledAt);
    console.log(`- ScheduledAt (Data):`, scheduledAt.toString());
    console.log(`- ScheduledAt (ISO):`, scheduledAt.toISOString());
    console.log(`- Diferença (min): ${diffMinutes.toFixed(2)}`);
    console.log(`- Deve processar? ${scheduledAt <= now ? 'SIM' : 'NÃO (Ainda no futuro)'}`);
  });
}

check().catch(console.error);
