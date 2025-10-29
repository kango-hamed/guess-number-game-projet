# Script de test de connexion réseau GuessCraft
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST DE CONNEXION RESEAU" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier l'IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*"}).IPAddress
Write-Host "[1] IP actuelle: $ip" -ForegroundColor Green

# Vérifier le .env
$envContent = Get-Content "client\.env" -Raw
if ($envContent -match "ws://(.+):8000") {
    Write-Host "[2] Fichier .env configure: $($matches[0])" -ForegroundColor Green
} else {
    Write-Host "[2] Erreur dans .env" -ForegroundColor Red
}

# Vérifier le pare-feu
$fw = Get-NetFirewallRule -DisplayName "*GuessCraft*" | Where-Object {$_.Enabled -eq "True"}
Write-Host "[3] Regles pare-feu actives: $($fw.Count)" -ForegroundColor Green

# Test de connectivité au port 8000
Write-Host ""
Write-Host "Test de connexion au serveur..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://$ip:8000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "[OK] Serveur accessible sur http://$ip:8000" -ForegroundColor Green
    Write-Host "Reponse: $($response.StatusCode) $($response.StatusDescription)" -ForegroundColor White
} catch {
    Write-Host "[ERREUR] Serveur non accessible" -ForegroundColor Red
    Write-Host "Assurez-vous que le serveur Python est demarre avec: python server/main.py" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pour demarrer le serveur:" -ForegroundColor White
Write-Host "  cd server" -ForegroundColor Gray
Write-Host "  python main.py" -ForegroundColor Gray
Write-Host ""
Write-Host "Pour demarrer le client:" -ForegroundColor White
Write-Host "  cd client" -ForegroundColor Gray
Write-Host "  npm run dev -- --host" -ForegroundColor Gray
Write-Host ""
Write-Host "Puis ouvrez: http://$ip:5173" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
