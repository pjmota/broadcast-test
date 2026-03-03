
// Script para simular o Scheduler do Firebase Functions localmente
// Requer Node.js 18+ (para suporte nativo a fetch)

const PROJECT_ID = 'broadcast-saas-dev';
const REGION = 'us-central1';
const FUNCTION_NAME = 'manualCheck';
const PORT = 5001;
const URL = `http://127.0.0.1:${PORT}/${PROJECT_ID}/${REGION}/${FUNCTION_NAME}`;

const INTERVAL_MS = 10 * 1000; // 10 segundos

console.log('🚀 Iniciando simulador de Agendamento Local (v2)...');
console.log(`📡 Alvo: ${URL}`);
console.log(`⏱️  Intervalo: ${INTERVAL_MS / 1000} segundos`);
console.log('---------------------------------------------------');

async function triggerScheduler() {
  const now = new Date();
  const timestamp = now.toLocaleTimeString();
  
  try {
    // Usando fetch nativo do Node 18+
    const response = await fetch(URL, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }

    // Tenta ler o JSON, mas lida com resposta vazia ou texto
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text };
    }
    
    if (data.count > 0) {
      console.log(`[${timestamp}] ✅ SUCESSO: ${data.count} mensagens enviadas!`);
      console.log(`           Detalhes: ${JSON.stringify(data)}`);
    } else {
      console.log(`[${timestamp}] 💤 Nenhuma mensagem pendente...`);
      if (data.debug) {
         console.log(`           DEBUG: Total no banco: ${data.debug.totalScheduled}`);
         console.log(`           DEBUG: Hora Servidor: ${data.debug.serverTime}`);
         if (data.debug.messages && data.debug.messages.length > 0) {
             console.log('           DEBUG: Próximas mensagens:');
             data.debug.messages.forEach(m => {
                 console.log(`             - ID: ${m.id} | Agendada: ${m.scheduledAt}`);
             });
         }
      }
    }

  } catch (error) {
    console.error(`\n[${timestamp}] ❌ ERRO ao chamar função:`);
    if (error.code === 'ECONNREFUSED') {
      console.error(`   -> Não foi possível conectar em ${URL}`);
      console.error(`   -> Verifique se o emulador de Functions está rodando na porta ${PORT}.`);
    } else {
      console.error(`   -> ${error.message}`);
    }
    if (error.cause) console.error('   -> Causa:', error.cause);
  }
}

// Executa imediatamente e depois no intervalo
triggerScheduler();
setInterval(triggerScheduler, INTERVAL_MS);
