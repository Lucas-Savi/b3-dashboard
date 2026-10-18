# ============================================================
#  Analisador de Acoes B3 - Script de inicializacao
#  Uso: clique duplo em start.bat  OU  .\start.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$ROOT     = Split-Path -Parent $MyInvocation.MyCommand.Path
$BACKEND  = "$ROOT\backend"
$FRONTEND = "$ROOT\frontend"
$NODE_DIR = "C:\Program Files\nodejs"

function Write-Step { param($msg) Write-Host "`n >> $msg" -ForegroundColor Cyan }
function Write-Ok   { param($msg) Write-Host "    [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "    [!]  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "    [X]  $msg" -ForegroundColor Red }

Clear-Host
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host "   Analisador de Acoes B3" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkGreen

# ----------------------------------------------------------
# 1. Adicionar Node.js ao PATH desta sessao se necessario
# ----------------------------------------------------------
if ((Test-Path "$NODE_DIR\node.exe") -and ($env:PATH -notlike "*$NODE_DIR*")) {
    $env:PATH = "$NODE_DIR;$env:PATH"
}

# ----------------------------------------------------------
# 2. Verificar pre-requisitos
# ----------------------------------------------------------
Write-Step "Verificando pre-requisitos..."

try {
    $nodeVer = node --version 2>&1
    Write-Ok "Node.js $nodeVer"
} catch {
    Write-Fail "Node.js nao encontrado. Baixe em https://nodejs.org"
    Read-Host "`nPressione Enter para sair"
    exit 1
}

try {
    $npmVer = npm --version 2>&1
    Write-Ok "npm v$npmVer"
} catch {
    Write-Fail "npm nao encontrado."
    Read-Host "`nPressione Enter para sair"
    exit 1
}

try {
    $pyVer = python --version 2>&1
    Write-Ok "$pyVer"
} catch {
    Write-Fail "Python nao encontrado. Baixe em https://python.org"
    Read-Host "`nPressione Enter para sair"
    exit 1
}

# ----------------------------------------------------------
# 3. Configurar backend
# ----------------------------------------------------------
Write-Step "Configurando backend Python..."

if (-not (Test-Path "$BACKEND\venv")) {
    Write-Warn "Criando ambiente virtual (primeira vez)..."
    python -m venv "$BACKEND\venv"
    Write-Ok "Ambiente virtual criado"
} else {
    Write-Ok "Ambiente virtual ja existe"
}

Write-Warn "Instalando/atualizando dependencias Python..."
Write-Host "    (pode levar alguns minutos na primeira execucao)" -ForegroundColor DarkGray
& "$BACKEND\venv\Scripts\pip.exe" install -r "$BACKEND\requirements.txt" --disable-pip-version-check
if ($LASTEXITCODE -ne 0) {
    Write-Warn "Primeira tentativa falhou. Recriando ambiente virtual limpo..."
    Remove-Item -Recurse -Force "$BACKEND\venv"
    python -m venv "$BACKEND\venv"
    & "$BACKEND\venv\Scripts\pip.exe" install -r "$BACKEND\requirements.txt" --disable-pip-version-check
    if ($LASTEXITCODE -ne 0) {
        Write-Fail "Erro ao instalar dependencias Python. Verifique requirements.txt."
        Read-Host "`nPressione Enter para sair"
        exit 1
    }
}
Write-Ok "Dependencias backend OK"

# ----------------------------------------------------------
# 4. Configurar frontend
# ----------------------------------------------------------
Write-Step "Configurando frontend Node.js..."

if (-not (Test-Path "$FRONTEND\node_modules")) {
    Write-Warn "Instalando dependencias npm (primeira vez)..."
    Push-Location $FRONTEND
    npm install --silent
    $npmExit = $LASTEXITCODE
    Pop-Location
    if ($npmExit -ne 0) {
        Write-Fail "Erro ao instalar dependencias npm."
        Read-Host "`nPressione Enter para sair"
        exit 1
    }
    Write-Ok "Dependencias npm instaladas"
} else {
    Write-Ok "node_modules ja existe"
}

# ----------------------------------------------------------
# 5. Iniciar servidores em novas janelas
# ----------------------------------------------------------
Write-Step "Iniciando servidores..."

# Janela do backend
$backendTitle = "Backend - Analisador B3 (porta 8000)"
$backendCmd = @"
`$Host.UI.RawUI.WindowTitle = '$backendTitle'
Write-Host '============================================' -ForegroundColor DarkGreen
Write-Host '  Backend rodando em http://localhost:8000  ' -ForegroundColor Green
Write-Host '  Docs da API: http://localhost:8000/docs   ' -ForegroundColor Cyan
Write-Host '============================================' -ForegroundColor DarkGreen
Set-Location '$BACKEND'
& '.\venv\Scripts\Activate.ps1'
uvicorn app.main:app --reload
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendCmd
Write-Ok "Backend iniciado (aguardando porta 8000...)"

# Aguardar backend subir
Start-Sleep -Seconds 5

# Janela do frontend
$frontendTitle = "Frontend - Analisador B3 (porta 5173)"
$frontendCmd = @"
`$env:PATH = '$NODE_DIR;' + `$env:PATH
`$Host.UI.RawUI.WindowTitle = '$frontendTitle'
Write-Host '============================================' -ForegroundColor DarkGreen
Write-Host '  Frontend rodando em http://localhost:5173 ' -ForegroundColor Green
Write-Host '============================================' -ForegroundColor DarkGreen
Set-Location '$FRONTEND'
npm run dev
"@
Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendCmd
Write-Ok "Frontend iniciado (aguardando porta 5173...)"

# Aguardar frontend compilar e abrir navegador
Start-Sleep -Seconds 5
Start-Process "http://localhost:5173"

# ----------------------------------------------------------
# 6. Resumo final
# ----------------------------------------------------------
Write-Host "`n============================================" -ForegroundColor DarkGreen
Write-Host "   Tudo pronto!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor DarkGreen
Write-Host "   Frontend : http://localhost:5173" -ForegroundColor Cyan
Write-Host "   Backend  : http://localhost:8000" -ForegroundColor Cyan
Write-Host "   API Docs : http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "`n   O navegador foi aberto automaticamente." -ForegroundColor Gray
Write-Host "   Para encerrar, feche as janelas Backend e Frontend." -ForegroundColor Gray
Write-Host "`n   Esta janela pode ser fechada agora.`n" -ForegroundColor DarkGray
