# SharePoint Integration Setup Guide

This guide will help you integrate your Life Makers Funds Dashboard with SharePoint.

## Prerequisites

1. **Azure Active Directory (AAD) App Registration** - Already configured ✅
2. **SharePoint Site** with a list containing your project data
3. **Node.js Backend** - Already set up ✅

## Step 1: SharePoint List Structure

Create a SharePoint list with the following columns:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Title | Single line of text | Yes | Project name |
| Donor | Single line of text | Yes | Donor organization |
| Type | Choice | Yes | International/Corporate |
| Year | Number | Yes | Project year (2018-2025) |
| BudgetEGP | Currency | No | Budget in Egyptian Pounds |
| AmountUSD | Currency | No | Amount in US Dollars |
| Note | Multiple lines of text | No | Project notes |
| UniqueProject | Single line of text | No | Unique project identifier |

## Step 2: Environment Configuration

Create a `.env` file in the `backend` directory with your SharePoint settings:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# SharePoint Configuration
SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/your-site
SHAREPOINT_LIST_NAME=Projects

# Azure Active Directory Configuration
AZURE_CLIENT_ID=your-client-id-here
AZURE_CLIENT_SECRET=your-client-secret-here
AZURE_TENANT_ID=your-tenant-id-here
```

## Step 3: Azure AD App Registration Permissions

Ensure your Azure AD app has the following permissions:

### Microsoft Graph Permissions:
- **Sites.Read.All** - Read site information
- **Sites.ReadWrite.All** - Read and write site information
- **Files.Read.All** - Read files
- **Files.ReadWrite.All** - Read and write files

### SharePoint Permissions:
- **Sites.Read.All** - Read site information
- **Sites.ReadWrite.All** - Read and write site information

## Step 4: Grant Admin Consent

1. Go to Azure Portal → App Registrations → Your App
2. Click on "API permissions"
3. Click "Grant admin consent for [Your Organization]"

## Step 5: Test the Integration

1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Check the console output for:
   ```
   SharePoint configured: true
   Fetching data from SharePoint...
   ```

3. Test the API endpoints:
   ```bash
   # Test basic connection
   curl http://localhost:5000/
   
   # Test projects endpoint
   curl http://localhost:5000/api/dashboard/projects
   ```

## Step 6: Data Migration (Optional)

If you have existing Excel data, you can:

1. **Export to CSV** from Excel
2. **Import to SharePoint** using the list import feature
3. **Or use the API** to add projects programmatically:

```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "project": "Improve the livelihood of refugees",
    "donor": "Plan International",
    "type": "International",
    "year": 2018,
    "budgetEGP": 1488770,
    "amountUSD": 85000,
    "note": "Refugee support program",
    "uniqueProject": "REF-001"
  }'
```

## Troubleshooting

### Common Issues:

1. **"SharePoint configured: false"**
   - Check your `.env` file variables
   - Ensure all required environment variables are set

2. **"Error getting access token"**
   - Verify Azure AD app credentials
   - Check if admin consent is granted
   - Ensure app has correct permissions

3. **"Error fetching data from SharePoint"**
   - Verify SharePoint site URL
   - Check list name matches exactly
   - Ensure column names match the expected format

4. **"FormDigest error"**
   - This is usually a permissions issue
   - Ensure the app has write permissions to the list

### Debug Mode:

Enable debug logging by setting:
```env
NODE_ENV=development
DEBUG=sharepoint:*
```

## API Endpoints

Once configured, the following endpoints will work with SharePoint:

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/projects` - List all projects (with filtering)
- `GET /api/dashboard/chart-data` - Chart data
- `GET /api/dashboard/filters` - Available filter options
- `POST /api/projects` - Add new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## Security Notes

1. **Environment Variables**: Never commit `.env` files to version control
2. **Client Secret**: Keep your Azure AD client secret secure
3. **Permissions**: Use least-privilege principle for app permissions
4. **HTTPS**: Always use HTTPS in production

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check the backend server logs
3. Verify SharePoint list permissions
4. Test with a simple project first

The dashboard will automatically fall back to mock data if SharePoint is not configured or if there are connection issues. 