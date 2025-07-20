# SharePoint Permissions Setup Script
# Run this script as Administrator

Write-Host "=== SharePoint Permissions Setup ===" -ForegroundColor Green
Write-Host ""

# Check if SharePoint Online Management Shell is installed
Write-Host "Checking SharePoint Online Management Shell..." -ForegroundColor Yellow
try {
    Import-Module Microsoft.Online.SharePoint.PowerShell -ErrorAction Stop
    Write-Host "✓ SharePoint Online Management Shell is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ SharePoint Online Management Shell is not installed" -ForegroundColor Red
    Write-Host "Installing SharePoint Online Management Shell..." -ForegroundColor Yellow
    
    try {
        Install-Module -Name Microsoft.Online.SharePoint.PowerShell -Force -AllowClobber
        Import-Module Microsoft.Online.SharePoint.PowerShell
        Write-Host "✓ SharePoint Online Management Shell installed successfully" -ForegroundColor Green
    } catch {
        Write-Host "✗ Failed to install SharePoint Online Management Shell" -ForegroundColor Red
        Write-Host "Please install it manually: Install-Module -Name Microsoft.Online.SharePoint.PowerShell" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host ""
Write-Host "=== Azure AD App Permissions Setup ===" -ForegroundColor Green
Write-Host ""

Write-Host "To set up Azure AD permissions, please:" -ForegroundColor Yellow
Write-Host "1. Go to https://portal.azure.com" -ForegroundColor Cyan
Write-Host "2. Navigate to Azure Active Directory > App registrations" -ForegroundColor Cyan
Write-Host "3. Find your app: LifeMakersDashboard (cf103822-5384-4aab-8d09-4cf0d0385439)" -ForegroundColor Cyan
Write-Host "4. Go to API permissions tab" -ForegroundColor Cyan
Write-Host "5. Add these Application permissions:" -ForegroundColor Cyan
Write-Host "   - User.Read.All" -ForegroundColor White
Write-Host "   - Files.Read.All" -ForegroundColor White
Write-Host "   - Sites.Read.All" -ForegroundColor White
Write-Host "   - Directory.Read.All" -ForegroundColor White
Write-Host "6. Click 'Grant admin consent'" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== SharePoint App-Only Authentication Setup ===" -ForegroundColor Green
Write-Host ""

$adminUrl = Read-Host "Enter your SharePoint admin URL (e.g., https://lifemaker-admin.sharepoint.com)"

if ($adminUrl) {
    Write-Host "Connecting to SharePoint admin..." -ForegroundColor Yellow
    try {
        Connect-SPOAdmin -Url $adminUrl
        Write-Host "✓ Connected to SharePoint admin" -ForegroundColor Green
        
        Write-Host "Registering SharePoint app..." -ForegroundColor Yellow
        Register-SPAppPrincipal -Name "LifeMakersDashboard" -DisplayName "Life Makers Dashboard"
        Write-Host "✓ SharePoint app registered" -ForegroundColor Green
        
        $siteUrl = Read-Host "Enter your SharePoint site URL (e.g., https://lifemaker-my.sharepoint.com)"
        
        if ($siteUrl) {
            Write-Host "Granting app permissions to site..." -ForegroundColor Yellow
            Set-SPAppPrincipalPermission -AppPrincipal "LifeMakersDashboard" -Site $siteUrl -Right "FullControl"
            Write-Host "✓ App permissions granted" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please check your SharePoint admin URL and credentials" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== Testing Setup ===" -ForegroundColor Green
Write-Host ""

Write-Host "After setting up permissions, test with:" -ForegroundColor Yellow
Write-Host "curl http://localhost:5000/api/test-permissions" -ForegroundColor Cyan
Write-Host "curl http://localhost:5000/api/test-sharepoint" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== Setup Complete ===" -ForegroundColor Green
Write-Host "Please follow the Azure AD setup steps above and then test the endpoints." -ForegroundColor Yellow 