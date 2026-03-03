
# Script para iniciar ambiente de desenvolvimento completo
# Inicia Emuladores Firebase e o Agendador Local em paralelo

Write-Host "Iniciando Ambiente de Desenvolvimento Broadcast SaaS..." -ForegroundColor Cyan

# Define caminhos
$RootPath = Get-Location
$ScriptPath = Join-Path $RootPath "scripts\local-scheduler.js"

# Compila as Funções do Firebase (Backend)
Write-Host "Compilando backend (Functions)..." -ForegroundColor Yellow
Set-Location "functions"
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Error "Erro ao compilar functions. Verifique os logs acima."
    exit $LASTEXITCODE
}
Set-Location ".."

# Inicia o Agendador Local em um novo processo
Write-Host "Iniciando Agendador Local..." -ForegroundColor Yellow
Start-Process node -ArgumentList "$ScriptPath"

# Inicia os Emuladores do Firebase (processo principal, bloqueante)
Write-Host "Iniciando Emuladores Firebase com persistencia..." -ForegroundColor Green
firebase emulators:start --import=./emulator-data --export-on-exit

# Nota: Quando voce encerrar o firebase (Ctrl+C), o node do scheduler continuara rodando em background nesta sessao.
# Para matar tudo, feche o terminal.
