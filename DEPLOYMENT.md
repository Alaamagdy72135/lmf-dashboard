# Deployment Guide

This guide will help you deploy the Life Makers Foundation Funds Dashboard to production.

## Prerequisites

1. **GitHub Account**: You need a GitHub account to host the repository
2. **Vercel Account**: For frontend deployment
3. **Railway/Render Account**: For backend deployment
4. **Domain Name** (optional): For custom domain

## Step 1: Upload to GitHub

1. **Create a new repository on GitHub**
   - Go to [github.com](https://github.com)
   - Click "New repository"
   - Name it `life-makers-dashboard`
   - Make it public or private (your choice)
   - Don't initialize with README (we already have one)

2. **Push your local repository to GitHub**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/life-makers-dashboard.git
   git branch -M main
   git push -u origin main
   ```

## Step 2: Deploy Backend

### Option A: Railway (Recommended)

1. **Go to Railway**
   - Visit [railway.app](https://railway.app)
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your `life-makers-dashboard` repository

3. **Configure Deployment**
   - Set the root directory to `backend`
   - Railway will automatically detect it's a Node.js project

4. **Add Environment Variables**
   - Go to the "Variables" tab
   - Add the following variables:
     ```
     ADMIN_USERNAME=your_secure_username
     ADMIN_PASSWORD=your_secure_password
     NODE_ENV=production
     PORT=5000
     ```
   - Add SharePoint variables if needed:
     ```
     SHAREPOINT_SITE_URL=your_sharepoint_url
     AZURE_CLIENT_ID=your_azure_client_id
     AZURE_CLIENT_SECRET=your_azure_client_secret
     AZURE_TENANT_ID=your_azure_tenant_id
     ```

5. **Deploy**
   - Railway will automatically deploy your backend
   - Note the generated URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. **Go to Render**
   - Visit [render.com](https://render.com)
   - Sign in with GitHub

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure Service**
   - Name: `life-makers-backend`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Add Environment Variables**
   - Same as Railway above

5. **Deploy**
   - Click "Create Web Service"
   - Render will deploy your backend

## Step 3: Deploy Frontend to Vercel

1. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

2. **Import Project**
   - Click "New Project"
   - Import your GitHub repository
   - Set the root directory to `frontend`

3. **Configure Project**
   - Framework Preset: `Create React App`
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Add Environment Variables**
   - Go to "Environment Variables"
   - Add:
     ```
     REACT_APP_API_URL=https://your-backend-url.railway.app
     ```
   - Replace with your actual backend URL

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your frontend

## Step 4: Configure Custom Domain (Optional)

### Frontend (Vercel)
1. Go to your Vercel project settings
2. Click "Domains"
3. Add your custom domain
4. Follow the DNS configuration instructions

### Backend (Railway/Render)
1. Go to your backend service settings
2. Add custom domain
3. Configure DNS records as instructed

## Step 5: Test Your Deployment

1. **Test Frontend**
   - Visit your Vercel URL
   - Test login functionality
   - Verify all dashboard features work

2. **Test Backend**
   - Test API endpoints directly
   - Verify authentication works
   - Check SharePoint integration (if configured)

## Environment Variables Reference

### Backend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `ADMIN_USERNAME` | Admin login username | Yes |
| `ADMIN_PASSWORD` | Admin login password | Yes |
| `NODE_ENV` | Environment (production) | Yes |
| `PORT` | Server port | No |
| `SHAREPOINT_SITE_URL` | SharePoint site URL | No |
| `AZURE_CLIENT_ID` | Azure AD client ID | No |
| `AZURE_CLIENT_SECRET` | Azure AD client secret | No |
| `AZURE_TENANT_ID` | Azure AD tenant ID | No |

### Frontend Variables
| Variable | Description | Required |
|----------|-------------|----------|
| `REACT_APP_API_URL` | Backend API URL | Yes |

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for your frontend domain
   - Check that `REACT_APP_API_URL` is correct

2. **Authentication Issues**
   - Verify environment variables are set correctly
   - Check that backend is accessible

3. **Build Failures**
   - Check build logs in Vercel
   - Ensure all dependencies are in package.json

4. **API Connection Issues**
   - Verify backend URL is correct
   - Check if backend is running and accessible

### Support

- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)

## Security Considerations

1. **Use Strong Passwords**
   - Generate secure passwords for admin credentials
   - Use environment variables, never hardcode

2. **HTTPS Only**
   - All production deployments use HTTPS
   - Never use HTTP in production

3. **Environment Variables**
   - Keep sensitive data in environment variables
   - Never commit `.env` files to Git

4. **Regular Updates**
   - Keep dependencies updated
   - Monitor for security vulnerabilities

## Monitoring and Maintenance

1. **Set up Monitoring**
   - Enable Vercel Analytics
   - Set up error tracking (Sentry, etc.)

2. **Regular Backups**
   - Backup your code repository
   - Backup any database data

3. **Performance Monitoring**
   - Monitor API response times
   - Check frontend performance metrics

## Next Steps

After successful deployment:

1. **Set up CI/CD**
   - Configure automatic deployments on Git push
   - Set up staging environments

2. **Add Analytics**
   - Google Analytics
   - User behavior tracking

3. **Implement Monitoring**
   - Error tracking
   - Performance monitoring
   - Uptime monitoring

4. **Security Hardening**
   - Rate limiting
   - Input validation
   - Security headers 