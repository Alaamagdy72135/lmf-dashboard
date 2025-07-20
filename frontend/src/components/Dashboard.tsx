import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Card,
  CardContent,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Business,
  AttachMoney,
  TrendingUp,
  FilterList,
  AccountCircle,
  Assignment,
  Add,
  Edit,
  Delete,
  Refresh,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import ProjectForm from './ProjectForm';

interface ProjectData {
  id: number;
  project: string;
  donor: string;
  type: string;
  year: number;
  budgetEGP: number;
  amountUSD: number;
  note: string;
  uniqueProject: string;
  stage: string;
}

interface DashboardStats {
  totalProjects: number;
  totalBudgetEGP: number;
  totalAmountUSD: number;
  uniqueDonors: number;
  stage1Projects: number;
  stage2Projects: number;
  averageProjectBudget: number;
}

interface ChartData {
  yearlyData: Array<{ year: number; budgetEGP: number; amountUSD: number; projects: number }>;
  stageData: Array<{ stage: string; budgetEGP: number; amountUSD: number; projects: number }>;
  donorData: Array<{ donor: string; budgetEGP: number; amountUSD: number; projects: number }>;
}

interface Filters {
  projects: string[];
  donors: string[];
  types: string[];
  years: number[];
  stages: string[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [filters, setFilters] = useState<Filters | null>(null);
  const [selectedFilters, setSelectedFilters] = useState({
    project: '',
    donor: '',
    type: '',
    year: '',
    stage: ''
  });
  const [loading, setLoading] = useState(false);
  const [projectFormOpen, setProjectFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<ProjectData | null>(null);
  const [error, setError] = useState('');

  const API_URL = process.env.REACT_APP_API_URL || 'https://lmf-dashboard.onrender.com';

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, chartRes, projectsRes, filtersRes] = await Promise.all([
        axios.get(`${API_URL}/api/dashboard/stats`),
        axios.get(`${API_URL}/api/dashboard/chart-data`),
        axios.get(`${API_URL}/api/dashboard/projects`),
        axios.get(`${API_URL}/api/dashboard/filters`),
      ]);

      setStats(statsRes.data);
      setChartData(chartRes.data);
      setProjects(projectsRes.data);
      setFilters(filtersRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterChange = async (filterType: string, value: string) => {
    const newFilters = { ...selectedFilters, [filterType]: value };
    setSelectedFilters(newFilters);
    
    try {
      const params = new URLSearchParams();
      Object.entries(newFilters).forEach(([key, val]) => {
        if (val) params.append(key, val);
      });
      
      const response = await axios.get(`${API_URL}/api/dashboard/projects?${params}`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error filtering projects:', error);
    }
  };

  const clearFilters = async () => {
    setSelectedFilters({
      project: '',
      donor: '',
      type: '',
      year: '',
      stage: ''
    });
    
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/projects`);
      setProjects(response.data);
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  };

  const handleAddProject = () => {
    setEditingProject(null);
    setProjectFormOpen(true);
  };

  const handleEditProject = (project: ProjectData) => {
    setEditingProject(project);
    setProjectFormOpen(true);
  };

  const handleDeleteProject = (project: ProjectData) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;
    
    try {
      await axios.delete(`${API_URL}/api/projects/${projectToDelete.id}`);
      setDeleteDialogOpen(false);
      setProjectToDelete(null);
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting project:', error);
      setError('Failed to delete project');
    }
  };

  const handleProjectFormSuccess = () => {
    setProjectFormOpen(false);
    setEditingProject(null);
    fetchData(); // Refresh data
  };

  const formatCurrency = (amount: number, currency: 'EGP' | 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Box>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'white', color: 'text.primary', mb: 3 }}>
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Life Makers Funds Dashboard
          </Typography>
          <IconButton color="inherit" onClick={fetchData} disabled={loading}>
            <Refresh />
          </IconButton>
          <IconButton color="inherit">
            <FilterList />
          </IconButton>
          <Avatar sx={{ ml: 2 }}>
            <AccountCircle />
          </Avatar>
        </Toolbar>
      </AppBar>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Projects
                </Typography>
                <Typography variant="h4">
                  {stats?.totalProjects || '0'}
                </Typography>
              </Box>
              <Assignment sx={{ fontSize: 40, color: 'primary.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Budget (EGP)
                </Typography>
                <Typography variant="h4">
                  {stats?.totalBudgetEGP ? formatCurrency(stats.totalBudgetEGP, 'EGP') : '0'}
                </Typography>
              </Box>
              <AttachMoney sx={{ fontSize: 40, color: 'success.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Total Amount (USD)
                </Typography>
                <Typography variant="h4">
                  {stats?.totalAmountUSD ? formatCurrency(stats.totalAmountUSD, 'USD') : '0'}
                </Typography>
              </Box>
              <Business sx={{ fontSize: 40, color: 'warning.main' }} />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: '1 1 250px', minWidth: 250 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="textSecondary" gutterBottom>
                  Unique Donors
                </Typography>
                <Typography variant="h4">
                  {stats?.uniqueDonors || '0'}
                </Typography>
              </Box>
              <TrendingUp sx={{ fontSize: 40, color: 'info.main' }} />
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Filter Projects
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={handleAddProject}>
            Add Project
          </Button>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Project</InputLabel>
            <Select
              value={selectedFilters.project}
              label="Project"
              onChange={(e) => handleFilterChange('project', e.target.value)}
            >
              <MenuItem value="">All Projects</MenuItem>
              {filters?.projects.map((project) => (
                <MenuItem key={project} value={project}>{project}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Donor</InputLabel>
            <Select
              value={selectedFilters.donor}
              label="Donor"
              onChange={(e) => handleFilterChange('donor', e.target.value)}
            >
              <MenuItem value="">All Donors</MenuItem>
              {filters?.donors.map((donor) => (
                <MenuItem key={donor} value={donor}>{donor}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={selectedFilters.type}
              label="Type"
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <MenuItem value="">All Types</MenuItem>
              {filters?.types.map((type) => (
                <MenuItem key={type} value={type}>{type}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Year</InputLabel>
            <Select
              value={selectedFilters.year}
              label="Year"
              onChange={(e) => handleFilterChange('year', e.target.value)}
            >
              <MenuItem value="">All Years</MenuItem>
              {filters?.years.map((year) => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Stage</InputLabel>
            <Select
              value={selectedFilters.stage}
              label="Stage"
              onChange={(e) => handleFilterChange('stage', e.target.value)}
            >
              <MenuItem value="">All Stages</MenuItem>
              {filters?.stages.map((stage) => (
                <MenuItem key={stage} value={stage}>{stage}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={clearFilters}>
            Clear Filters
          </Button>
        </Box>
      </Paper>

      {/* Charts and Data */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Yearly Budget Chart */}
        <Paper sx={{ p: 3, flex: '2 1 600px', minWidth: 600 }}>
          <Typography variant="h6" gutterBottom>
            Yearly Budget Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData?.yearlyData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value), 'EGP')} />
              <Line type="monotone" dataKey="budgetEGP" stroke="#1976d2" strokeWidth={2} name="Budget (EGP)" />
            </LineChart>
          </ResponsiveContainer>
        </Paper>

        {/* Stage Comparison */}
        <Paper sx={{ p: 3, flex: '1 1 300px', minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>
            Stage Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData?.stageData || []}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ stage, projects }) => `${stage}: ${projects}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="budgetEGP"
              >
                {chartData?.stageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value), 'EGP')} />
            </PieChart>
          </ResponsiveContainer>
        </Paper>

        {/* Donor Comparison */}
        <Paper sx={{ p: 3, flex: '1 1 500px', minWidth: 500 }}>
          <Typography variant="h6" gutterBottom>
            Donor Comparison
          </Typography>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData?.donorData || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="donor" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value), 'EGP')} />
              <Bar dataKey="budgetEGP" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Projects List */}
        <Paper sx={{ p: 3, flex: '1 1 500px', minWidth: 500, maxHeight: 400, overflow: 'auto' }}>
          <Typography variant="h6" gutterBottom>
            Projects ({projects.length})
          </Typography>
          <List>
            {projects.slice(0, 10).map((project, index) => (
              <React.Fragment key={project.id}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>
                    <Chip label={project.stage} size="small" color={project.stage === "Stage 1" ? "primary" : "secondary"} />
                  </ListItemIcon>
                  <ListItemText
                    primary={project.project}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {project.donor} • {project.year} • {project.type}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {formatCurrency(project.budgetEGP, 'EGP')} • {formatCurrency(project.amountUSD, 'USD')}
                        </Typography>
                      </Box>
                    }
                  />
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton size="small" onClick={() => handleEditProject(project)}>
                      <Edit />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteProject(project)}>
                      <Delete />
                    </IconButton>
                  </Box>
                </ListItem>
                {index < projects.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Add/Edit Project Form */}
      <ProjectForm
        open={projectFormOpen}
        onClose={() => setProjectFormOpen(false)}
        project={editingProject}
        onSuccess={handleProjectFormSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Project</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{projectToDelete?.project}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={handleAddProject}
      >
        <Add />
      </Fab>
    </Box>
  );
};

export default Dashboard; 