import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";
import { Timestamp } from "firebase-admin/firestore";

admin.initializeApp();

// Exportar modelos e tipos
export * from './models';

// Função auxiliar com a lógica de negócio
async function processScheduledMessages() {
    const now = Timestamp.now();
    const db = admin.firestore();
    
    logger.info('>>> processScheduledMessages INICIADA <<<');
    logger.info('Project ID:', process.env.GCLOUD_PROJECT);
    logger.info('Hora atual (Timestamp):', now.toMillis());
    logger.info('Hora atual (ISO):', now.toDate().toISOString());
  
    try {
      // Buscar mensagens com status 'scheduled'
      const messagesRef = db.collection('messages');
      
      const snapshot = await messagesRef
        .where('status', '==', 'scheduled')
        .where('scheduledAt', '<=', now)
        .get();
    
      logger.info(`Query retornou ${snapshot.size} mensagens para processar.`);
    
      // Debug: Logar todas as mensagens agendadas (sem filtro de tempo) para verificar
      const allScheduled = await messagesRef.where('status', '==', 'scheduled').get();
      const debugInfo = allScheduled.docs.map(d => ({
        id: d.id,
        scheduledAt: d.data().scheduledAt?.toDate().toISOString(),
        now: now.toDate().toISOString()
      }));
      
      logger.info(`DEBUG: Total de mensagens com status 'scheduled' no banco: ${allScheduled.size}`);
      debugInfo.forEach(d => {
         logger.info(`DEBUG Msg ${d.id}: scheduledAt=${d.scheduledAt}, NOW=${d.now}`);
      });
    
      if (snapshot.empty) {
        logger.info('Nenhuma mensagem agendada para processar neste momento.');
        return { 
          success: true, 
          count: 0, 
          message: 'Nenhuma mensagem para processar.',
          debug: {
            totalScheduled: allScheduled.size,
            serverTime: now.toDate().toISOString(),
            messages: debugInfo
          }
        };
      }
    
      const batch = db.batch();
      let count = 0;
    
      snapshot.docs.forEach((doc) => {
        const data = doc.data();
        logger.info(`Processando mensagem ${doc.id} agendada para: ${data.scheduledAt?.toDate().toISOString()}`);
        
        batch.update(doc.ref, { 
          status: 'sent',
          sentAt: Timestamp.now()
        });
        count++;
      });
  
      await batch.commit();
      logger.info(`${count} mensagens agendadas foram enviadas com sucesso.`);
      return { success: true, count, message: `${count} mensagens processadas.` };
      
    } catch (error) {
      logger.error('Erro ao processar mensagens agendadas:', error);
      throw error;
    }
}

/**
 * Função agendada para verificar mensagens agendadas e enviá-las.
 * Executa a cada 1 minuto.
 */
export const checkScheduledMessages = onSchedule("every 1 minutes", async (event) => {
    await processScheduledMessages();
});

/**
 * Função HTTP para forçar a verificação manualmente (útil para testes).
 */
export const manualCheck = onRequest(async (req, res) => {
    try {
        const result = await processScheduledMessages();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ 
            error: 'Erro interno ao processar mensagens.',
            details: error.message,
            stack: error.stack
        });
    }
});

