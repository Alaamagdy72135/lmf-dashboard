# 🚀 SharePoint Integration Guide for Life Makers Funds Dashboard

## Overview

Your Life Makers Funds Dashboard is now fully integrated with SharePoint! This guide will walk you through the complete setup process.

## ✅ What's Already Done

- ✅ **Dashboard UI** - Modern, responsive interface with filtering and charts
- ✅ **Backend API** - Complete REST API with SharePoint integration
- ✅ **CRUD Operations** - Add, edit, delete projects directly from the dashboard
- ✅ **Real-time Data** - Automatic data fetching from SharePoint
- ✅ **Fallback System** - Works with mock data if SharePoint is unavailable

## 🔧 Step-by-Step Integration

### Step 1: SharePoint List Setup

1. **Go to your SharePoint site**
2. **Create a new list** called "Projects"
3. **Add these columns**:

| Column Name | Type | Required | Description |
|-------------|------|----------|-------------|
| Title | Single line of text | ✅ Yes | Project name |
| Donor | Single line of text | ✅ Yes | Donor organization |
| Type | Choice | ✅ Yes | International/Corporate/Government/NGO |
| Year | Number | ✅ Yes | Project year (2018-2025) |
| BudgetEGP | Currency | ❌ No | Budget in Egyptian Pounds |
| AmountUSD | Currency | ❌ No | Amount in US Dollars |
| Note | Multiple lines of text | ❌ No | Project notes |
| UniqueProject | Single line of text | ❌ No | Unique project identifier |

### Step 2: Environment Configuration

1. **Create `.env` file** in the `backend` folder:

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

2. **Replace the placeholder values** with your actual Azure AD app credentials

### Step 3: Azure AD App Permissions

Ensure your Azure AD app has these permissions:

**Microsoft Graph:**
- `Sites.Read.All`
- `Sites.ReadWrite.All`

**SharePoint:**
- `Sites.Read.All`
- `Sites.ReadWrite.All`

### Step 4: Test the Integration

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Check the console output:**
   ```
   Server is running on port 5000
   SharePoint configured: true
   Fetching data from SharePoint...
   ```

3. **Start the frontend:**
   ```bash
   cd frontend
   npm start
   ```

4. **Open the dashboard** at `http://localhost:3000`

## 🎯 Dashboard Features

### 📊 **Real-time Data Display**
- **Statistics Cards**: Total projects, budgets, donors
- **Interactive Charts**: Yearly trends, stage comparison, donor analysis
- **Live Filtering**: Filter by project, donor, type, year, stage

### 🔧 **Project Management**
- **Add Projects**: Click "Add Project" button or floating action button
- **Edit Projects**: Click edit icon on any project
- **Delete Projects**: Click delete icon with confirmation dialog
- **Real-time Updates**: Changes reflect immediately in charts and stats

### 📱 **Responsive Design**
- Works on desktop, tablet, and mobile
- Modern Material-UI interface
- Professional color scheme

## 🔄 Data Migration Options

### Option 1: Manual Entry
Use the dashboard's "Add Project" form to enter data manually.

### Option 2: CSV Import
1. Export your Excel data to CSV
2. Import to SharePoint list using SharePoint's import feature
3. Data will automatically appear in the dashboard

### Option 3: API Import
Use the API to programmatically add projects:

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

## 🛠️ Troubleshooting

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

4. **Dashboard shows no data**
   - Check if SharePoint list has data
   - Verify column names match exactly
   - Check browser console for errors

### Debug Mode:
Add to your `.env` file:
```env
NODE_ENV=development
DEBUG=sharepoint:*
```

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` files to version control
2. **Client Secret**: Keep your Azure AD client secret secure
3. **Permissions**: Use least-privilege principle for app permissions
4. **HTTPS**: Always use HTTPS in production

## 📈 API Endpoints

Once configured, these endpoints work with SharePoint:

- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/projects` - List all projects (with filtering)
- `GET /api/dashboard/chart-data` - Chart data
- `GET /api/dashboard/filters` - Available filter options
- `POST /api/projects` - Add new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

## 🎉 Success Indicators

You'll know the integration is working when:

1. ✅ Backend console shows "SharePoint configured: true"
2. ✅ Dashboard loads with real data from SharePoint
3. ✅ Charts display actual project data
4. ✅ Adding/editing projects works and persists to SharePoint
5. ✅ Filters work with real data

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Check the backend server logs
3. Verify SharePoint list permissions
4. Test with a simple project first
5. Ensure all environment variables are correct

The dashboard will automatically fall back to mock data if SharePoint is not configured or if there are connection issues, so you can always test the interface even without SharePoint.

---

**🎯 Your Life Makers Funds Dashboard is now ready to track projects from 2018-2025 with full SharePoint integration!** 