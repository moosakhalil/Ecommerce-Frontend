# Batch Update Script for Remaining Files
# This script updates all files with localhost:5000 to use centralized config

$ErrorActionPreference = "Continue"
$updated = 0
$failed = 0
$skipped = 0

# Files to update (from grep search results)
$filesToUpdate = @(
    "componenets\Products\viewProducts.js",
    "componenets\Products\productmanagement.js",
    "componenets\Products\ProductListReadOnly.js",
    "componenets\Products\addProducts.js",
    "componenets\Vehicles\ViewVehicles.js",
    "componenets\Vehicles\ViewVehicle.js",
    "componenets\Vehicles\SelectVehicle.js",
    "componenets\Vehicles\EditVehicle.js",
    "componenets\Vehicles\AddVehicleStep2.js",
    "componenets\Vehicles\AddVehicleStep1.js",
    "componenets\Vehicles\AddVehicle.js",
    "componenets\Transactions\BankAccountview.js",
    "componenets\Transactions\transaction-verification.js",
    "componenets\Transactions\transactioncontrol.js",
    "componenets\SupplyStockArrival\SupplierOrderList.js",
    "componenets\SupplyStockArrival\OrderDetailsPage.js",
    "componenets\SupplyStockArrival\IssueReportModal.js",
    "componenets\Settings\Calendar.js",
    "componenets\Settings\AreaManagementB.js",
    "componenets\Refferal\IntroductionVideos.js",
    "componenets\Refferal\Foremanprofits.js",
    "componenets\Refferal\referraldemovideo.js",
    "componenets\Refferal\referralDashboard.js",
    "componenets\Refferal\referaldata.js",
    "componenets\Finance\Competitors.js",
    "componenets\Orders\Non-delivered-orders.js",
    "componenets\Orders\allOrders.js",
    "componenets\Orders\ordersIncart.js",
    "componenets\Orders\Refunds.js",
    "componenets\Inventory\FillIinventory.js",
    "componenets\Inventory\InventoryControl.js",
    "componenets\Inventory\outofstocklist.js",
    "componenets\Inventory\orderlist.js",
    "componenets\Inventory\InverntoryCheck.js",
    "componenets\Inventory\Loststock.js",
    "componenets\Order-management\ScooterDelivery.js",
    "componenets\Order-management\pickup-orders.js",
    "componenets\Order-management\orderdetails.js",
    "componenets\Order-management\delivery-orders.js",
    "componenets\Discounts\Inventorycontrol(discounts).js",
    "componenets\Discounts\DiscountedInventory.js",
    "componenets\Discounts\createDiscounts.js",
    "componenets\Discounts\allDiscounts.js",
    "componenets\DeliveryFees\DeliveryFees.js",
    "componenets\Customers\viewChat.js",
    "componenets\Support\supportManagemnt.js"
)

$srcPath = "c:\Users\MOOSA KHALIL\Desktop\Ecommerce\frontend\src"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Batch Update: Centralized API Config" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

foreach ($file in $filesToUpdate) {
    $fullPath = Join-Path $srcPath $file
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "[SKIP] $file (not found)" -ForegroundColor Yellow
        $skipped++
        continue
    }
    
    try {
        $content = Get-Content $fullPath -Raw -Encoding UTF8
        $originalContent = $content
        $hasChanges = $false
        
        # Pattern 1: const API_URL = "http://localhost:5000"
        if ($content -match 'const\s+API_URL\s*=\s*["\']http://localhost:5000["\']') {
            $content = $content -replace 'const\s+API_URL\s*=\s*["\']http://localhost:5000["\'];?', 'import { API_BASE_URL } from ''../../utils/config'';\r\nconst API_URL = API_BASE_URL;'
            $hasChanges = $true
        }
        
        # Pattern 2: const API_BASE_URL = "http://localhost:5000"
        if ($content -match 'const\s+API_BASE_URL\s*=\s*["\']http://localhost:5000["\']') {
            # Check if import already exists
            if ($content -notmatch 'import.*API_BASE_URL.*from.*utils/config') {
                # Add import at the top after other imports
                $content = $content -replace '(import.*?;[\r\n]+)(?!import)', "`$1import { API_BASE_URL } from '../../utils/config';`r`n"
            }
            # Remove the const declaration
            $content = $content -replace 'const\s+API_BASE_URL\s*=\s*["\']http://localhost:5000["\'];?[\r\n]*', ''
            $hasChanges = $true
        }
        
        # Pattern 3: const baseURL = "http://localhost:5000"
        if ($content -match 'const\s+baseURL\s*=\s*["\']http://localhost:5000["\']') {
            $content = $content -replace 'const\s+baseURL\s*=\s*["\']http://localhost:5000["\'];?', 'import { API_BASE_URL } from ''../../utils/config'';\r\nconst baseURL = API_BASE_URL;'
            $hasChanges = $true
        }
        
        if ($hasChanges) {
            Set-Content -Path $fullPath -Value $content -Encoding UTF8 -NoNewline
            Write-Host "[OK] $file" -ForegroundColor Green
            $updated++
        } else {
            Write-Host "[SKIP] $file (no localhost:5000 pattern found)" -ForegroundColor Yellow
            $skipped++
        }
        
    } catch {
        Write-Host "[FAIL] $file - $($_.Exception.Message)" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Updated: $updated files" -ForegroundColor Green
Write-Host "  Skipped: $skipped files" -ForegroundColor Yellow
Write-Host "  Failed:  $failed files" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Cyan
