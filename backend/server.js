const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const axios = require('axios'); // Added axios for permission testing
const path = require('path');

const SharePointService = require('./sharepoint');

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS to allow requests from frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());

// Simple in-memory session storage (in production, use Redis or database)
const sessions = new Map();

// Simple authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const session = sessions.get(token);
  if (!session) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = session.user;
  next();
};

// Authentication routes
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  // Check for environment variables for authentication
  const validUsername = process.env.ADMIN_USERNAME || 'admin';
  const validPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  if (username === validUsername && password === validPassword) {
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    const user = { username, role: 'admin' };
    
    sessions.set(token, { user, createdAt: Date.now() });
    
    res.json({
      success: true,
      token,
      user: { username, role: 'admin' }
    });
  } else {
    res.status(401).json({ error: 'Invalid credentials' });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token) {
    sessions.delete(token);
  }
  
  res.json({ success: true, message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  res.json({ user: req.user });
});

// Initialize SharePoint service
const sharePointService = new SharePointService();

// MongoDB Connection (optional for now)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/life-makers-dashboard';

// Only connect to MongoDB if URI is provided and not localhost (for development)
if (MONGODB_URI && !MONGODB_URI.includes('localhost')) {
  mongoose.connect(MONGODB_URI)
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((error) => {
      console.log('MongoDB connection skipped (using mock data)');
    });
} else {
  console.log('Using mock data (MongoDB not configured)');
}

// Life Makers Funds Data (fallback mock data)
const mockProjectsData = [
  { id: 1, project: "Improve the livelihood of refugees", donor: "Plan International", type: "International", year: 2018, budgetEGP: 1488770, amountUSD: 0, note: "", uniqueProject: "REF-001", stage: "Stage1" },
  { id: 2, project: "Support Community education for refugee chlidren", donor: "Plan International", type: "International", year: 2018, budgetEGP: 669152, amountUSD: 0, note: "", uniqueProject: "REF-002", stage: "Stage1" },
  { id: 3, project: "Development of the Blind School", donor: "SAMSUNG", type: "National", year: 2018, budgetEGP: 6243338, amountUSD: 0, note: "", uniqueProject: "BLIND-001", stage: "Stage1" },
  { id: 4, project: "Haya Karima", donor: "MOSS", type: "National", year: 2019, budgetEGP: 45000000, amountUSD: 0, note: "", uniqueProject: "HAYA-001", stage: "Stage1" },
  { id: 5, project: "Eisha w Hawya", donor: "Federation of Egyption Banks", type: "National", year: 2019, budgetEGP: 5490293, amountUSD: 0, note: "", uniqueProject: "EISHA-001", stage: "Stage1" },
  { id: 6, project: "Samsung Inovation Campus (SIC 1)", donor: "SAMSUNG", type: "National", year: 2020, budgetEGP: 1824150, amountUSD: 0, note: "", uniqueProject: "SIC-001", stage: "Stage1" },
  { id: 7, project: "Samsung Inovation Campus (SIC 2)", donor: "SAMSUNG", type: "National", year: 2021, budgetEGP: 2279985, amountUSD: 0, note: "", uniqueProject: "SIC-002", stage: "Stage2" },
  { id: 8, project: "El-NAs l Baadaa", donor: "Sawiras Foundation", type: "National", year: 2020, budgetEGP: 12000000, amountUSD: 0, note: "", uniqueProject: "ELNAS-001", stage: "Stage1" },
  { id: 9, project: "Support the Suez during Corona", donor: "Suez Industrial Development Company", type: "National", year: 2020, budgetEGP: 500000, amountUSD: 0, note: "", uniqueProject: "SUEZ-001", stage: "Stage1" },
  { id: 10, project: "El- Mowatna", donor: "MOSS", type: "National", year: 2020, budgetEGP: 2330350, amountUSD: 0, note: "", uniqueProject: "MOWATNA-001", stage: "Stage1" },
  { id: 11, project: "Develope Child and Family Centers", donor: "MOSS", type: "National", year: 2020, budgetEGP: 21000000, amountUSD: 0, note: "", uniqueProject: "CHILD-001", stage: "Stage1" },
  { id: 12, project: "Develope Early Childhood Nurseries", donor: "MOSS", type: "National", year: 2020, budgetEGP: 28000000, amountUSD: 0, note: "", uniqueProject: "NURSERY-001", stage: "Stage1" },
  { id: 13, project: "Youth Network 'Daeem'", donor: "MOSS", type: "National", year: 2020, budgetEGP: 3929770, amountUSD: 0, note: "", uniqueProject: "DAEEM-001", stage: "Stage1" },
  { id: 14, project: "Fostering Young Community Leaders", donor: "UNDEF", type: "International", year: 2020, budgetEGP: 3440778, amountUSD: 0, note: "", uniqueProject: "LEADERS-001", stage: "Stage1" },
  { id: 15, project: "Uni-Green", donor: "EU", type: "International", year: 2020, budgetEGP: 12638100, amountUSD: 0, note: "", uniqueProject: "UNIGREEN-001", stage: "Stage1" },
  { id: 16, project: "Job Search Club", donor: "ILO", type: "International", year: 2022, budgetEGP: 1077321, amountUSD: 0, note: "", uniqueProject: "JOB-001", stage: "Stage2" },
  { id: 17, project: "Safir", donor: "EU - French Institute in Cairo", type: "International", year: 2020, budgetEGP: 548538, amountUSD: 0, note: "", uniqueProject: "SAFIR-001", stage: "Stage1" },
  { id: 18, project: "Samsung Inovation Campus (SIC 3)", donor: "SAMSUNG", type: "National", year: 2022, budgetEGP: 2570721, amountUSD: 0, note: "", uniqueProject: "SIC-003", stage: "Stage2" },
  { id: 19, project: "The Development of refugee economic projects", donor: "ILO", type: "International", year: 2022, budgetEGP: 1430819, amountUSD: 0, note: "", uniqueProject: "REF-ECON-001", stage: "Stage2" },
  { id: 20, project: "Cmprehensive development and empowerment of women", donor: "Sawiras Foundation", type: "National", year: 2022, budgetEGP: 31897048, amountUSD: 0, note: "", uniqueProject: "WOMEN-001", stage: "Stage2" },
  { id: 21, project: "Samsung Inovation Campus (SIC 4)", donor: "SAMSUNG", type: "National", year: 2022, budgetEGP: 2888726, amountUSD: 0, note: "", uniqueProject: "SIC-004", stage: "Stage2" },
  { id: 22, project: "Forsa", donor: "MOSS", type: "National", year: 2022, budgetEGP: 45000000, amountUSD: 0, note: "", uniqueProject: "FORSA-001", stage: "Stage2" },
  { id: 23, project: "Cmprehensive development of Dashna Center", donor: "Banque Misr Foundation", type: "National", year: 2022, budgetEGP: 13287740, amountUSD: 0, note: "", uniqueProject: "DASHNA-001", stage: "Stage2" },
  { id: 24, project: "Aisha and Haweya", donor: "Federation of Egyption Banks", type: "National", year: 2021, budgetEGP: 5586092, amountUSD: 0, note: "", uniqueProject: "AISHA-002", stage: "Stage2" },
  { id: 25, project: "Social innovation Incubator", donor: "UNFPA", type: "International", year: 2022, budgetEGP: 5000000, amountUSD: 0, note: "", uniqueProject: "INCUBATOR-001", stage: "Stage2" },
  { id: 26, project: "Waay Program", donor: "MOSS", type: "National", year: 2022, budgetEGP: 1185000, amountUSD: 0, note: "", uniqueProject: "WAAY-001", stage: "Stage2" },
  { id: 27, project: "Safir - Phase 2", donor: "EU - French Institute in Cairo", type: "International", year: 2023, budgetEGP: 1333438, amountUSD: 0, note: "", uniqueProject: "SAFIR-002", stage: "Stage2" },
  { id: 28, project: "Ready for Tomorrow", donor: "Plan International", type: "International", year: 2023, budgetEGP: 20000000, amountUSD: 0, note: "", uniqueProject: "TOMORROW-001", stage: "Stage2" },
  { id: 29, project: "Samsung Inovation Campus (SIC 5)", donor: "SAMSUNG", type: "National", year: 2023, budgetEGP: 5507999, amountUSD: 0, note: "", uniqueProject: "SIC-005", stage: "Stage2" },
  { id: 30, project: "Dar wa Salama", donor: "Sawiras Foundation", type: "National", year: 2024, budgetEGP: 52789695, amountUSD: 0, note: "", uniqueProject: "DAR-001", stage: "Stage2" },
  { id: 31, project: "Nawr Hayathom", donor: "MOSS", type: "National", year: 2024, budgetEGP: 8580400, amountUSD: 0, note: "", uniqueProject: "NAWR-001", stage: "Stage2" },
  { id: 32, project: "Samsung Inovation Campus (SIC 6)", donor: "SAMSUNG", type: "National", year: 2024, budgetEGP: 5507999, amountUSD: 0, note: "", uniqueProject: "SIC-006", stage: "Stage2" },
  { id: 33, project: "Samsung Inovation Campus (SIC7)", donor: "SAMSUNG", type: "National", year: 2025, budgetEGP: 9500000, amountUSD: 0, note: "", uniqueProject: "SIC-007", stage: "Stage2" },
  { id: 34, project: "Tamkeen", donor: "GIZ", type: "International", year: 2024, budgetEGP: 27000000, amountUSD: 0, note: "", uniqueProject: "TAMKEEN-001", stage: "Stage2" },
  { id: 35, project: "Develope Nurseries", donor: "MOSS", type: "National", year: 2024, budgetEGP: 17788500, amountUSD: 0, note: "", uniqueProject: "NURSERY-002", stage: "Stage2" },
  { id: 36, project: "Cmprehensive development of Qeft Center", donor: "Banque Misr Foundation", type: "National", year: 2025, budgetEGP: 34432200, amountUSD: 0, note: "", uniqueProject: "QEFT-001", stage: "Stage2" },
  { id: 37, project: "Steps Forward", donor: "UNHCR", type: "International", year: 2025, budgetEGP: 12000000, amountUSD: 0, note: "", uniqueProject: "STEPS-001", stage: "Stage2" },
  { id: 38, project: "SAWA", donor: "EU", type: "International", year: 2024, budgetEGP: 115000000, amountUSD: 0, note: "", uniqueProject: "SAWA-001", stage: "Stage2" },
  { id: 39, project: "United we Stand", donor: "Plan International - Drosos", type: "International", year: 2025, budgetEGP: 19460000, amountUSD: 0, note: "", uniqueProject: "UNITED-001", stage: "Stage2" },
  { id: 40, project: "SCREAM", donor: "Plan International - ILO", type: "International", year: 2025, budgetEGP: 6067720, amountUSD: 0, note: "", uniqueProject: "SCREAM-001", stage: "Stage2" },
  { id: 41, project: "Ahsan Saheb", donor: "MOSS", type: "National", year: 2024, budgetEGP: 28000000, amountUSD: 0, note: "", uniqueProject: "AHSAN-001", stage: "Stage2" }
];

// Helper function to get projects data (SharePoint or mock)
async function getProjectsData() {
  try {
    // Check if SharePoint is configured
    if (process.env.SHAREPOINT_SITE_URL && process.env.AZURE_CLIENT_ID) {
      console.log('Fetching data from SharePoint...');
      return await sharePointService.getProjectsFromSharePoint();
    } else {
      console.log('Using mock data (SharePoint not configured)');
      return mockProjectsData;
    }
  } catch (error) {
    console.error('Error fetching data, falling back to mock data:', error);
    return mockProjectsData;
  }
}

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Life Makers Funds Dashboard API',
    sharePointConfigured: !!(process.env.SHAREPOINT_SITE_URL && process.env.AZURE_CLIENT_ID)
  });
});

// Dashboard statistics endpoint
app.get('/api/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const projects = await getProjectsData();
    
    // Calculate statistics
    const totalProjects = projects.length;
    const totalBudget = projects.reduce((sum, project) => sum + project.budgetEGP, 0);
    
    // Unique donors
    const uniqueDonors = [...new Set(projects.map(p => p.donor))];
    const uniqueDonorsCount = uniqueDonors.length;
    
    // International vs National donors
    const internationalDonors = [...new Set(projects.filter(p => p.type === 'International').map(p => p.donor))];
    const nationalDonors = [...new Set(projects.filter(p => p.type === 'National').map(p => p.donor))];
    
    // Stage statistics
    const stage1Projects = projects.filter(p => p.stage === 'Stage1');
    const stage2Projects = projects.filter(p => p.stage === 'Stage2');
    
    const stage1Budget = stage1Projects.reduce((sum, project) => sum + project.budgetEGP, 0);
    const stage2Budget = stage2Projects.reduce((sum, project) => sum + project.budgetEGP, 0);
    
    // Year statistics
    const yearStats = {};
    projects.forEach(project => {
      if (!yearStats[project.year]) {
        yearStats[project.year] = { count: 0, budget: 0 };
      }
      yearStats[project.year].count++;
      yearStats[project.year].budget += project.budgetEGP;
    });
    
    // Donor comparison by stage
    const donorStageComparison = {};
    projects.forEach(project => {
      if (!donorStageComparison[project.donor]) {
        donorStageComparison[project.donor] = { Stage1: 0, Stage2: 0, total: 0 };
      }
      donorStageComparison[project.donor][project.stage]++;
      donorStageComparison[project.donor].total++;
    });
    
    // Format numbers with thousands separator
    const formatNumber = (num) => num.toLocaleString('en-US');
    
    res.json({
      totalProjects,
      totalBudget: formatNumber(totalBudget),
      uniqueDonors: uniqueDonorsCount,
      internationalDonors: internationalDonors.length,
      nationalDonors: nationalDonors.length,
      stage1Projects: stage1Projects.length,
      stage2Projects: stage2Projects.length,
      stage1Budget: formatNumber(stage1Budget),
      stage2Budget: formatNumber(stage2Budget),
      yearStats: Object.keys(yearStats).reduce((acc, year) => {
        acc[year] = {
          count: yearStats[year].count,
          budget: formatNumber(yearStats[year].budget)
        };
        return acc;
      }, {}),
      donorStageComparison,
      uniqueDonorsList: uniqueDonors,
      internationalDonorsList: internationalDonors,
      nationalDonorsList: nationalDonors
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ error: 'Failed to get dashboard statistics' });
  }
});

app.get('/api/dashboard/projects', authenticateToken, async (req, res) => {
  try {
    const { project, donor, type, year, stage } = req.query;
    
    let projectsData = await getProjectsData();
    
    if (project) {
      projectsData = projectsData.filter(p => 
        p.project.toLowerCase().includes(project.toLowerCase())
      );
    }
    
    if (donor) {
      projectsData = projectsData.filter(p => 
        p.donor.toLowerCase().includes(donor.toLowerCase())
      );
    }
    
    if (type) {
      projectsData = projectsData.filter(p => p.type === type);
    }
    
    if (year) {
      projectsData = projectsData.filter(p => p.year === parseInt(year));
    }
    
    if (stage) {
      projectsData = projectsData.filter(p => p.stage === stage);
    }
    
    res.json(projectsData);
  } catch (error) {
    console.error('Error getting projects:', error);
    res.status(500).json({ error: 'Failed to get projects' });
  }
});

app.get('/api/dashboard/chart-data', async (req, res) => {
  try {
    const projectsData = await getProjectsData();
    
    // Yearly budget comparison
    const yearlyData = projectsData.reduce((acc, project) => {
      const year = project.year;
      if (!acc[year]) {
        acc[year] = { year, budgetEGP: 0, amountUSD: 0, projects: 0 };
      }
      acc[year].budgetEGP += project.budgetEGP;
      acc[year].amountUSD += project.amountUSD;
      acc[year].projects += 1;
      return acc;
    }, {});

    const yearlyChartData = Object.values(yearlyData).sort((a, b) => a.year - b.year);

    // Stage comparison
    const stageData = projectsData.reduce((acc, project) => {
      const stage = project.stage;
      if (!acc[stage]) {
        acc[stage] = { stage, budgetEGP: 0, amountUSD: 0, projects: 0 };
      }
      acc[stage].budgetEGP += project.budgetEGP;
      acc[stage].amountUSD += project.amountUSD;
      acc[stage].projects += 1;
      return acc;
    }, {});

    const stageChartData = Object.values(stageData);

    // Donor comparison
    const donorData = projectsData.reduce((acc, project) => {
      const donor = project.donor;
      if (!acc[donor]) {
        acc[donor] = { donor, budgetEGP: 0, amountUSD: 0, projects: 0 };
      }
      acc[donor].budgetEGP += project.budgetEGP;
      acc[donor].amountUSD += project.amountUSD;
      acc[donor].projects += 1;
      return acc;
    }, {});

    const donorChartData = Object.values(donorData).sort((a, b) => b.budgetEGP - a.budgetEGP);

    res.json({
      yearlyData: yearlyChartData,
      stageData: stageChartData,
      donorData: donorChartData
    });
  } catch (error) {
    console.error('Error getting chart data:', error);
    res.status(500).json({ error: 'Failed to get chart data' });
  }
});

app.get('/api/dashboard/filters', async (req, res) => {
  try {
    const projectsData = await getProjectsData();
    
    const projects = [...new Set(projectsData.map(p => p.project))];
    const donors = [...new Set(projectsData.map(p => p.donor))];
    const types = [...new Set(projectsData.map(p => p.type))];
    const years = [...new Set(projectsData.map(p => p.year))].sort();
    const stages = [...new Set(projectsData.map(p => p.stage))];

    res.json({
      projects,
      donors,
      types,
      years,
      stages
    });
  } catch (error) {
    console.error('Error getting filters:', error);
    res.status(500).json({ error: 'Failed to get filters' });
  }
});

// CRUD operations for projects
app.post('/api/projects', async (req, res) => {
  try {
    const projectData = req.body;
    
    // Validate required fields
    if (!projectData.project || !projectData.donor || !projectData.year) {
      return res.status(400).json({ error: 'Project, donor, and year are required' });
    }

    // Determine stage based on year
    projectData.stage = projectData.year < 2021 ? 'Stage 1' : 'Stage 2';
    
    // Generate unique project ID if not provided
    if (!projectData.uniqueProject) {
      projectData.uniqueProject = `PROJ-${Date.now()}`;
    }

    let result;
    if (process.env.SHAREPOINT_SITE_URL && process.env.AZURE_CLIENT_ID) {
      // Add to SharePoint
      result = await sharePointService.addProjectToSharePoint(projectData);
    } else {
      // Add to mock data
      projectData.id = mockProjectsData.length + 1;
      mockProjectsData.push(projectData);
      result = projectData;
    }

    res.status(201).json(result);
  } catch (error) {
    console.error('Error adding project:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
});

app.put('/api/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const projectData = req.body;
    
    // Determine stage based on year
    projectData.stage = projectData.year < 2021 ? 'Stage 1' : 'Stage 2';

    let result;
    if (process.env.SHAREPOINT_SITE_URL && process.env.AZURE_CLIENT_ID) {
      // Update in SharePoint
      result = await sharePointService.updateProjectInSharePoint(projectId, projectData);
    } else {
      // Update in mock data
      const index = mockProjectsData.findIndex(p => p.id === projectId);
      if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }
      mockProjectsData[index] = { ...mockProjectsData[index], ...projectData };
      result = mockProjectsData[index];
    }

    res.json(result);
  } catch (error) {
    console.error('Error updating project:', error);
    res.status(500).json({ error: 'Failed to update project' });
  }
});

app.delete('/api/projects/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);

    if (process.env.SHAREPOINT_SITE_URL && process.env.AZURE_CLIENT_ID) {
      // Delete from SharePoint
      await sharePointService.deleteProjectFromSharePoint(projectId);
    } else {
      // Delete from mock data
      const index = mockProjectsData.findIndex(p => p.id === projectId);
      if (index === -1) {
        return res.status(404).json({ error: 'Project not found' });
      }
      mockProjectsData.splice(index, 1);
    }

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Test SharePoint Excel access
app.get('/api/test-sharepoint', async (req, res) => {
  try {
    console.log('Testing SharePoint Excel access...');
    const sharePointService = new SharePointService();
    
    // Test getting access token
    const token = await sharePointService.getAccessToken();
    console.log('Access token obtained successfully');
    
    // Test getting Excel file
    const excelBuffer = await sharePointService.getExcelFileContent();
    
    if (excelBuffer) {
      console.log('Excel file accessed successfully, size:', excelBuffer.length, 'bytes');
      
      // Test parsing Excel
      const projects = sharePointService.parseExcelData(excelBuffer);
      
      res.json({
        success: true,
        message: 'SharePoint Excel integration working',
        tokenLength: token.length,
        excelFileSize: excelBuffer.length,
        projectsCount: projects.length,
        sampleProjects: projects.slice(0, 3)
      });
    } else {
      res.json({
        success: false,
        message: 'Could not access Excel file, using mock data',
        tokenLength: token.length,
        fallbackData: sharePointService.getMockData().slice(0, 3)
      });
    }
  } catch (error) {
    console.error('SharePoint test error:', error);
    res.status(500).json({
      success: false,
      message: 'SharePoint test failed',
      error: error.message
    });
  }
});

// Test Azure AD permissions
app.get('/api/test-permissions', async (req, res) => {
  try {
    console.log('Testing Azure AD permissions...');
    const sharePointService = new SharePointService();
    
    // Test getting access token
    const token = await sharePointService.getAccessToken();
    console.log('Access token obtained successfully');
    
    // Test Microsoft Graph API permissions
    const graphUrl = 'https://graph.microsoft.com/v1.0';
    
    // Test 1: Try to get user info
    try {
      const userResponse = await axios.get(`${graphUrl}/users/alaa_magdy_lifemakers_org`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('User info access: SUCCESS');
    } catch (error) {
      console.log('User info access: FAILED -', error.response?.status, error.response?.data?.error?.message);
    }
    
    // Test 2: Try to list files in user drive
    try {
      const filesResponse = await axios.get(`${graphUrl}/users/alaa_magdy_lifemakers_org/drive/root/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('Files listing access: SUCCESS - Found', filesResponse.data.value.length, 'files');
    } catch (error) {
      console.log('Files listing access: FAILED -', error.response?.status, error.response?.data?.error?.message);
    }
    
    // Test 3: Try to access SharePoint site
    try {
      const siteResponse = await axios.get(`${graphUrl}/sites/lifemaker-my.sharepoint.com:/sites/lifemaker`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('SharePoint site access: SUCCESS');
    } catch (error) {
      console.log('SharePoint site access: FAILED -', error.response?.status, error.response?.data?.error?.message);
    }
    
    res.json({
      success: true,
      message: 'Permission test completed',
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      recommendations: [
        'Check Azure AD app permissions in portal.azure.com',
        'Ensure Files.Read.All and Sites.Read.All permissions are granted',
        'Grant admin consent for the permissions',
        'Consider using SharePoint App-Only authentication as alternative'
      ]
    });
    
  } catch (error) {
    console.error('Permission test error:', error);
    res.status(500).json({
      success: false,
      message: 'Permission test failed',
      error: error.message
    });
  }
});

// Detailed permission test
app.get('/api/test-permissions-detailed', async (req, res) => {
  try {
    console.log('Testing Azure AD permissions with detailed output...');
    const sharePointService = new SharePointService();
    
    // Test getting access token
    const token = await sharePointService.getAccessToken();
    console.log('Access token obtained successfully');
    
    // Test Microsoft Graph API permissions
    const graphUrl = 'https://graph.microsoft.com/v1.0';
    const results = {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50) + '...',
      tests: {}
    };
    
    // Test 1: Try to get user info
    try {
      const userResponse = await axios.get(`${graphUrl}/users/alaa_magdy_lifemakers_org`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('User info access: SUCCESS');
      results.tests.userInfo = { status: 'SUCCESS', data: userResponse.data };
    } catch (error) {
      console.log('User info access: FAILED -', error.response?.status, error.response?.data?.error?.message);
      results.tests.userInfo = { 
        status: 'FAILED', 
        error: error.response?.data?.error?.message || error.message,
        statusCode: error.response?.status
      };
    }
    
    // Test 2: Try to list files in user drive
    try {
      const filesResponse = await axios.get(`${graphUrl}/users/alaa_magdy_lifemakers_org/drive/root/children`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('Files listing access: SUCCESS - Found', filesResponse.data.value.length, 'files');
      results.tests.filesListing = { 
        status: 'SUCCESS', 
        fileCount: filesResponse.data.value.length,
        files: filesResponse.data.value.map(f => ({ name: f.name, id: f.id, type: f['@microsoft.graph.downloadUrl'] ? 'file' : 'folder' }))
      };
    } catch (error) {
      console.log('Files listing access: FAILED -', error.response?.status, error.response?.data?.error?.message);
      results.tests.filesListing = { 
        status: 'FAILED', 
        error: error.response?.data?.error?.message || error.message,
        statusCode: error.response?.status
      };
    }
    
    // Test 3: Try to access SharePoint site
    try {
      const siteResponse = await axios.get(`${graphUrl}/sites/lifemaker-my.sharepoint.com:/sites/lifemaker`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('SharePoint site access: SUCCESS');
      results.tests.sharePointSite = { status: 'SUCCESS', data: siteResponse.data };
    } catch (error) {
      console.log('SharePoint site access: FAILED -', error.response?.status, error.response?.data?.error?.message);
      results.tests.sharePointSite = { 
        status: 'FAILED', 
        error: error.response?.data?.error?.message || error.message,
        statusCode: error.response?.status
      };
    }
    
    // Test 4: Try to access the specific Excel file
    try {
      const fileResponse = await axios.get(`${graphUrl}/users/alaa_magdy_lifemakers_org/drive/items/EUM7vulvE5FGnGuORb_qj0cB2VWLI_dyXL3sOwasEBUp8A`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      console.log('Excel file metadata access: SUCCESS');
      results.tests.excelFileMetadata = { status: 'SUCCESS', data: fileResponse.data };
    } catch (error) {
      console.log('Excel file metadata access: FAILED -', error.response?.status, error.response?.data?.error?.message);
      results.tests.excelFileMetadata = { 
        status: 'FAILED', 
        error: error.response?.data?.error?.message || error.message,
        statusCode: error.response?.status
      };
    }
    
    res.json({
      success: true,
      message: 'Detailed permission test completed',
      ...results,
      recommendations: [
        'If User.Read.All fails: Grant User.Read.All permission in Azure AD',
        'If Files.Read.All fails: Grant Files.Read.All permission in Azure AD', 
        'If Sites.Read.All fails: Grant Sites.Read.All permission in Azure AD',
        'Make sure to grant admin consent after adding permissions'
      ]
    });
    
  } catch (error) {
    console.error('Detailed permission test error:', error);
    res.status(500).json({
      success: false,
      message: 'Detailed permission test failed',
      error: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`SharePoint configured: ${!!(process.env.SHAREPOINT_SITE_URL && process.env.AZURE_CLIENT_ID)}`);
}); 