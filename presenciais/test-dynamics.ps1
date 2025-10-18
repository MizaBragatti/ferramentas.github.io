# Script PowerShell para teste de dinâmica (SEM chaves reais)
# test-dynamics.ps1

Write-Host "🧪 Teste de Dinâmica Firebase (Chaves Falsas)" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Carregar variáveis de teste
Write-Host "📁 Carregando variáveis de TESTE..." -ForegroundColor Yellow
Get-Content ".env.test" | ForEach-Object {
    if ($_ -match "^([^#][^=]+)=(.*)$") {
        [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        Write-Host "   $($matches[1]): ✅ $($matches[2].Substring(0, 15))..." -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "⚠️ IMPORTANTE: Usando chaves FALSAS para teste!" -ForegroundColor Yellow
Write-Host "✅ Você pode verificar:" -ForegroundColor Cyan
Write-Host "   - Se as variáveis são injetadas no HTML" -ForegroundColor White
Write-Host "   - Se os logs aparecem no console do navegador" -ForegroundColor White
Write-Host "   - Se a detecção de configuração funciona" -ForegroundColor White
Write-Host "   - Se o fluxo de carregamento está correto" -ForegroundColor White
Write-Host ""
Write-Host "❌ O que VAI falhar (esperado):" -ForegroundColor Red
Write-Host "   - Conexão com Firebase (chaves são falsas)" -ForegroundColor White
Write-Host "   - Operações de banco de dados" -ForegroundColor White
Write-Host ""

# Iniciar o servidor
Write-Host "🚀 Iniciando servidor de teste..." -ForegroundColor Cyan
Write-Host "📍 Acesse: http://localhost:3000/presenciais.html" -ForegroundColor Yellow
Write-Host "🔍 Abra DevTools (F12) para ver os logs!" -ForegroundColor Magenta
Write-Host ""
Write-Host "⏹️ Para parar: Ctrl+C" -ForegroundColor Gray
Write-Host ""

npm start