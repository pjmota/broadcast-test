import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

// Exportar modelos e tipos
export * from './models';

// Placeholder para futuras funções
export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});
