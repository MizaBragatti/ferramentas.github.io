# Script PowerShell para testar localmente com variáveis de ambiente
# test-local.ps1

Write-Host "🔥 Firebase Local Test Setup" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado!" -ForegroundColor Red
    Write-Host "📥 Instale o Node.js: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js encontrado: $(node --version)" -ForegroundColor Green

# Verificar se as dependências estão instaladas
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Instalando dependências..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro ao instalar dependências!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dependências OK" -ForegroundColor Green
Write-Host ""

# Verificar se existe arquivo .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️ Arquivo .env.local não encontrado!" -ForegroundColor Yellow
    Write-Host "💡 Você pode:" -ForegroundColor Cyan
    Write-Host "   1. Criar .env.local com suas credenciais Firebase" -ForegroundColor White
    Write-Host "   2. Ou definir as variáveis manualmente" -ForegroundColor White
    Write-Host ""
    
    $choice = Read-Host "Deseja criar .env.local agora? (s/n)"
    if ($choice -eq "s" -or $choice -eq "S") {
        Copy-Item ".env.template" ".env.local"
        Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
        Write-Host "📝 Edite o arquivo .env.local com suas credenciais Firebase" -ForegroundColor Yellow
        Write-Host "🚀 Depois execute novamente: .\test-local.ps1" -ForegroundColor Cyan
        exit 0
    }
}

# Carregar variáveis do .env.local se existir
if (Test-Path ".env.local") {
    Write-Host "📁 Carregando .env.local..." -ForegroundColor Cyan
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
            Write-Host "   $($matches[1]): ✅ Definida" -ForegroundColor Green
        }
    }
    Write-Host ""
}

# Verificar variáveis essenciais
$requiredVars = @("FIREBASE_API_KEY", "FIREBASE_PROJECT_ID")
$missing = @()

foreach ($var in $requiredVars) {
    if (-not [Environment]::GetEnvironmentVariable($var)) {
        $missing += $var
    }
}

if ($missing.Count -gt 0) {
    Write-Host "❌ Variáveis obrigatórias não definidas:" -ForegroundColor Red
    $missing | ForEach-Object { Write-Host "   - $_" -ForegroundColor Red }
    Write-Host ""
    Write-Host "💡 Defina as variáveis ou edite .env.local" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Exemplo manual:" -ForegroundColor Cyan
    Write-Host '$env:FIREBASE_API_KEY="sua_api_key"' -ForegroundColor White
    Write-Host '$env:FIREBASE_PROJECT_ID="seu_project_id"' -ForegroundColor White
    Write-Host 'npm start' -ForegroundColor White
    exit 1
}

Write-Host "✅ Todas as variáveis Firebase configuradas!" -ForegroundColor Green
Write-Host ""

# Iniciar o servidor
Write-Host "🚀 Iniciando servidor local..." -ForegroundColor Cyan
Write-Host "📍 Acesse: http://localhost:3000/presenciais.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "⏹️ Para parar: Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm start