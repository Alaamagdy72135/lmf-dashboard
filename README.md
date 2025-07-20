# Life Makers Foundation Funds Dashboard

A comprehensive, interactive dashboard for Life Makers Foundation Funds projects with filtering, comparisons, and visual insights.

## Features

- 📊 Interactive charts and visualizations
- 🔍 Advanced filtering and search capabilities
- 📱 Fully responsive design
- 🔐 Secure authentication system
- 📈 Year-to-year and stage-to-stage growth analysis
- 🎨 Modern UI with brand colors and glassmorphism effects
- 📊 SharePoint integration with fallback to mock data

## Tech Stack

- **Frontend**: React, Material-UI (MUI), Recharts
- **Backend**: Node.js, Express
- **Authentication**: Token-based with session management
- **Data Source**: SharePoint Excel files (with mock data fallback)
- **Deployment**: Vercel (Frontend), Railway/Render (Backend)

## Quick Start

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd life-makers-dashboard
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the `backend` directory:
   ```env
   # Authentication
   ADMIN_USERNAME=your_admin_username
   ADMIN_PASSWORD=your_secure_password
   
   # SharePoint Configuration (optional)
   SHAREPOINT_SITE_URL=https://your-tenant.sharepoint.com/sites/your-site
   AZURE_CLIENT_ID=your_azure_client_id
   AZURE_CLIENT_SECRET=your_azure_client_secret
   AZURE_TENANT_ID=your_azure_tenant_id
   
   # MongoDB (optional)
   MONGODB_URI=mongodb://localhost:27017/life-makers-dashboard
   
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm start
   
   # Start frontend (from frontend directory)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Deployment

### Frontend (Vercel)

1. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set the root directory to `frontend`

2. **Configure environment variables**
   - Add `REACT_APP_API_URL` pointing to your backend URL
   - Example: `https://your-backend.railway.app`

3. **Deploy**
   - Vercel will automatically deploy on every push to main branch

### Backend (Railway/Render)

1. **Deploy to Railway**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Set the root directory to `backend`
   - Add all environment variables from the `.env` file

2. **Alternative: Deploy to Render**
   - Go to [render.com](https://render.com)
   - Create a new Web Service
   - Connect your GitHub repository
   - Set the root directory to `backend`
   - Add environment variables

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `ADMIN_USERNAME` | Admin username for login | Yes | `admin` |
| `ADMIN_PASSWORD` | Admin password for login | Yes | `admin123` |
| `SHAREPOINT_SITE_URL` | SharePoint site URL | No | - |
| `AZURE_CLIENT_ID` | Azure AD client ID | No | - |
| `AZURE_CLIENT_SECRET` | Azure AD client secret | No | - |
| `AZURE_TENANT_ID` | Azure AD tenant ID | No | - |
| `MONGODB_URI` | MongoDB connection string | No | - |
| `PORT` | Server port | No | `5000` |
| `NODE_ENV` | Environment mode | No | `development` |

## Project Structure

```
life-makers-dashboard/
├── frontend/                 # React frontend application
│   ├── public/              # Static files
│   ├── src/                 # Source code
│   │   ├── components/      # React components
│   │   ├── App.js          # Main application
│   │   └── index.js        # Entry point
│   └── package.json        # Frontend dependencies
├── backend/                 # Node.js backend application
│   ├── services/           # Business logic services
│   ├── server.js           # Express server
│   └── package.json        # Backend dependencies
└── README.md               # This file
```

## Features Overview

### Dashboard Components
- **Overview Tab**: Key metrics and summary statistics
- **Projects Tab**: Detailed project listings with filtering
- **Donors Tab**: Donor analysis and insights
- **Analytics Tab**: Advanced charts and comparisons

### Filtering Capabilities
- Year range selection
- Donor type filtering
- Project stage filtering
- Search functionality
- Sticky filter bar for easy access

### Visualizations
- Bar charts with growth percentages
- Pie charts with thousands separators
- Area charts with visible labels
- Interactive tooltips and legends

### Responsive Design
- Mobile-first approach
- Flexible layouts using Flexbox
- Adaptive card sizes
- Touch-friendly interface

## Security Features

- Token-based authentication
- Session management
- CORS configuration
- Environment variable protection
- Secure password handling

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please contact the development team or create an issue in the repository. 