# Required Permissions for SharePoint Excel Access

## Current Error Analysis

From the permission test, we're getting these specific errors:

1. **User info access: FAILED - 403 Insufficient privileges to complete the operation**
2. **Files listing access: FAILED - 404 User not found** 
3. **SharePoint site access: FAILED - 401 General exception while processing**

## Required Azure AD App Permissions

### 1. Microsoft Graph API Permissions (Application Permissions)

You need to add these **Application Permissions** (not Delegated) to your Azure AD app:

#### Essential Permissions:
- **`User.Read.All`** - Read all users' full profiles
- **`Files.Read.All`** - Read all files that user can access  
- **`Sites.Read.All`** - Read items in all site collections
- **`Directory.Read.All`** - Read directory data

#### Additional Permissions (if needed):
- **`Group.Read.All`** - Read all groups
- **`Mail.Read`** - Read user mail (if accessing email-related data)

### 2. SharePoint Permissions

For SharePoint-specific access:
- **`Sites.Read.All`** - Read items in all site collections
- **`Files.Read.All`** - Read all files that user can access

## Step-by-Step Setup Instructions

### Step 1: Configure Azure AD App Permissions

1. **Go to Azure Portal:**
   - Navigate to [portal.azure.com](https://portal.azure.com)
   - Sign in with your admin account

2. **Find Your App:**
   - Go to **Azure Active Directory** > **App registrations**
   - Search for: `LifeMakersDashboard` (Client ID: `cf103822-5384-4aab-8d09-4cf0d0385439`)

3. **Add API Permissions:**
   - Click on your app
   - Go to **API permissions** tab
   - Click **Add a permission**
   - Select **Microsoft Graph**
   - Choose **Application permissions** (not Delegated)
   - Add these permissions one by one:
     - `User.Read.All`
     - `Files.Read.All` 
     - `Sites.Read.All`
     - `Directory.Read.All`

4. **Grant Admin Consent:**
   - After adding permissions, click **Grant admin consent for [Your Organization]**
   - This requires Global Administrator or Privileged Role Administrator privileges

### Step 2: Verify Permissions

After granting permissions, test again:

```bash
curl http://localhost:5000/api/test-permissions
```

Expected successful response:
```json
{
  "success": true,
  "message": "Permission test completed",
  "userInfoAccess": "SUCCESS",
  "filesListingAccess": "SUCCESS - Found X files",
  "sharePointSiteAccess": "SUCCESS"
}
```

### Step 3: Alternative - SharePoint App-Only Authentication

If Azure AD permissions don't work, use SharePoint App-Only:

1. **Install SharePoint Online Management Shell:**
   ```powershell
   Install-Module -Name Microsoft.Online.SharePoint.PowerShell
   ```

2. **Connect to SharePoint Admin:**
   ```powershell
   Connect-SPOAdmin -Url https://lifemaker-admin.sharepoint.com
   ```

3. **Register SharePoint App:**
   ```powershell
   Register-SPAppPrincipal -Name "LifeMakersDashboard" -DisplayName "Life Makers Dashboard"
   ```

4. **Grant App Permissions:**
   ```powershell
   Set-SPAppPrincipalPermission -AppPrincipal "LifeMakersDashboard" -Site "https://lifemaker-my.sharepoint.com" -Right "FullControl"
   ```

## Permission Hierarchy

### Application Permissions vs Delegated Permissions

- **Application Permissions**: App acts on its own behalf (what we need)
- **Delegated Permissions**: App acts on behalf of a signed-in user (requires user login)

### Required Permission Scopes

For accessing SharePoint Excel files, you need:

1. **User Access**: `User.Read.All` - To access user information
2. **File Access**: `Files.Read.All` - To read Excel files
3. **Site Access**: `Sites.Read.All` - To access SharePoint sites
4. **Directory Access**: `Directory.Read.All` - To read directory data

## Troubleshooting Common Issues

### Issue 1: "Insufficient privileges to complete the operation"
**Solution**: Grant `User.Read.All` permission and admin consent

### Issue 2: "User not found" 
**Solution**: Grant `Directory.Read.All` permission and admin consent

### Issue 3: "General exception while processing"
**Solution**: Grant `Sites.Read.All` permission and admin consent

### Issue 4: Admin consent not available
**Solution**: Contact your Azure AD Global Administrator to grant consent

## Testing After Permission Setup

1. **Test Permissions:**
   ```bash
   curl http://localhost:5000/api/test-permissions
   ```

2. **Test SharePoint Excel Access:**
   ```bash
   curl http://localhost:5000/api/test-sharepoint
   ```

3. **Test Dashboard Data:**
   ```bash
   curl http://localhost:5000/api/dashboard/projects
   ```

## Expected Results After Proper Permissions

### Successful Permission Test:
```json
{
  "success": true,
  "message": "Permission test completed",
  "userInfoAccess": "SUCCESS",
  "filesListingAccess": "SUCCESS - Found 15 files",
  "sharePointSiteAccess": "SUCCESS"
}
```

### Successful SharePoint Test:
```json
{
  "success": true,
  "message": "SharePoint Excel integration working",
  "excelFileSize": 12345,
  "projectsCount": 25,
  "sampleProjects": [...]
}
```

## Next Steps

1. **Immediate**: Grant the required permissions in Azure AD
2. **Alternative**: Set up SharePoint App-Only authentication
3. **Fallback**: Continue using mock data while permissions are configured

## Contact Information

If you need help with Azure AD administration:
- Contact your organization's Global Administrator
- Or use SharePoint App-Only authentication as an alternative 