# PowerShell script to update all remaining files with hardcoded localhost URLs
# This script replaces hardcoded API_BASE_URL constants with imports from centralized config

$frontendPath = "c:\Users\MOOSA KHALIL\Desktop\Ecommerce\frontend\src"

# Pattern 1: const API_BASE_URL = "http://localhost:5000";
# Pattern 2: const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

Write-Host "Starting URL centralization script..." -ForegroundColor Green
Write-Host "Searching for files with hardcoded localhost URLs..." -ForegroundColor Yellow

# Find all JavaScript files with hardcoded localhost URLs
$files = Get-ChildItem -Path $frontendPath -Recurse -Include *.js,*.jsx | 
    Where-Object { 
        $content = Get-Content $_.FullName -Raw
        $content -match 'const API_BASE_URL = "http://localhost:5000"' -or
        $content -match "const API_BASE_URL = 'http://localhost:5000'" -or
        $content -match 'http://localhost:5000' 
    }

Write-Host "Found $($files.Count) files to update" -ForegroundColor Cyan

$updatedCount = 0
$skippedCount = 0

foreach ($file in $files) {
    $relativePath = $file.FullName.Replace($frontendPath + "\", "")
    Write-Host "`nProcessing: $relativePath" -ForegroundColor White
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Skip if already has the import
    if ($content -match 'import.*API_BASE_URL.*from.*utils/config') {
        Write-Host "  ✓ Already updated (has import)" -ForegroundColor Gray
        $skippedCount++
        continue
    }
    
    # Pattern 1: Replace standalone const declaration
    if ($content -match 'const API_BASE_URL = "http://localhost:5000";') {
        # Calculate relative path to utils/config.js
        $depth = ($relativePath -split '\\').Count - 1
        $importPath = "../" * $depth + "utils/config"
        
        # Replace the const declaration with import
        $content = $content -replace 'const API_BASE_URL = "http://localhost:5000";', "import { API_BASE_URL } from '$importPath';"
        
        Write-Host "  ✓ Replaced const declaration with import" -ForegroundColor Green
        $updatedCount++
    }
    # Pattern 2: Replace with fallback
    elseif ($content -match 'const API_BASE_URL = process\.env\.REACT_APP_API_URL \|\| "http://localhost:5000";') {
        $depth = ($relativePath -split '\\').Count - 1
        $importPath = "../" * $depth + "utils/config"
        
        $content = $content -replace 'const API_BASE_URL = process\.env\.REACT_APP_API_URL \|\| "http://localhost:5000";', "import { API_BASE_URL } from '$importPath';"
        
        Write-Host "  ✓ Replaced const with fallback" -ForegroundColor Green
        $updatedCount++
    }
    else {
        Write-Host "  ⚠ Contains localhost URLs but no const declaration - manual review needed" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Only write if content changed
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  💾 File saved" -ForegroundColor Green
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor White
Write-Host "  Updated: $updatedCount files" -ForegroundColor Green
Write-Host "  Skipped: $skippedCount files" -ForegroundColor Yellow
Write-Host "  Total processed: $($files.Count) files" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review the changes with: git diff" -ForegroundColor White
Write-Host "2. Test locally: npm start" -ForegroundColor White
Write-Host "3. Build for production: npm run build" -ForegroundColor White
Write-Host "4. Deploy to Vercel with environment variable set" -ForegroundColor White
