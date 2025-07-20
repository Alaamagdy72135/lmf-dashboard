import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  AppBar,
  Toolbar,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Drawer,
  Fab,
  Badge,
  Collapse,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  FilterList,
  Sort,
  TrendingUp,
  Analytics,
  Compare,
  Refresh,
  Download,
  Search,
  CalendarToday,
  Layers,
  People,
  Clear,
  Assignment,
  AccountBalance,
  Group,
  Public,
  Flag,
  Close,
  FilterAlt
} from '@mui/icons-material';
import Login from './components/Login';
import Logo from './components/Logo';
import Insights from './components/Insights';

// Brand colors from logo
const BRAND_COLORS = {
  primary: '#224466', // Dark blue
  secondary: '#EE9933', // Orange
  background: '#335544', // Dark green
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  text: '#333333',
  lightText: '#666666'
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [filteredStats, setFilteredStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filtersHover, setFiltersHover] = useState(false);
  
  // Filters state
  const [filters, setFilters] = useState({
    search: '',
    donor: '',
    type: '',
    year: '',
    stage: ''
  });
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'year',
    direction: 'desc'
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
      fetchData(token);
    } else {
      setLoading(false);
    }
  }, []);

  const applyFiltersAndSort = useCallback(() => {
    let filtered = [...projects];

    // Apply filters
    if (filters.search) {
      filtered = filtered.filter(project =>
        project.project.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.donor.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.donor) {
      filtered = filtered.filter(project => project.donor === filters.donor);
    }
    if (filters.type) {
      filtered = filtered.filter(project => project.type === filters.type);
    }
    if (filters.year) {
      filtered = filtered.filter(project => project.year === parseInt(filters.year));
    }
    if (filters.stage) {
      filtered = filtered.filter(project => project.stage === filters.stage);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      
      if (sortConfig.key === 'budgetEGP') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredProjects(filtered);
    
    // Calculate filtered stats
    if (filtered.length > 0) {
      const totalProjects = filtered.length;
      const totalBudget = filtered.reduce((sum, p) => sum + p.budgetEGP, 0);
      const uniqueDonors = [...new Set(filtered.map(p => p.donor))].length;
      const internationalDonors = [...new Set(filtered.filter(p => p.type === 'International').map(p => p.donor))].length;
      const nationalDonors = [...new Set(filtered.filter(p => p.type === 'National').map(p => p.donor))].length;
      
      const stage1Projects = filtered.filter(p => p.stage === 'Stage1').length;
      const stage2Projects = filtered.filter(p => p.stage === 'Stage2').length;
      const stage1Budget = filtered.filter(p => p.stage === 'Stage1').reduce((sum, p) => sum + p.budgetEGP, 0);
      const stage2Budget = filtered.filter(p => p.stage === 'Stage2').reduce((sum, p) => sum + p.budgetEGP, 0);
      
      const yearStats = {};
      filtered.forEach(project => {
        if (!yearStats[project.year]) {
          yearStats[project.year] = { count: 0, budget: 0 };
        }
        yearStats[project.year].count++;
        yearStats[project.year].budget += project.budgetEGP;
      });
      
      setFilteredStats({
        totalProjects,
        totalBudget: totalBudget.toLocaleString(),
        uniqueDonors,
        internationalDonors,
        nationalDonors,
        stage1Projects,
        stage2Projects,
        stage1Budget: stage1Budget.toLocaleString(),
        stage2Budget: stage2Budget.toLocaleString(),
        yearStats
      });
    } else {
      setFilteredStats(null);
    }
  }, [projects, filters, sortConfig]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [applyFiltersAndSort]);

  const fetchData = async (token) => {
    try {
      const [statsResponse, projectsResponse] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/projects', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (projectsResponse.ok) {
        const projectsData = await projectsResponse.json();
        setProjects(projectsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (token, userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    fetchData(token);
  };

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setStats(null);
      setProjects([]);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      donor: '',
      type: '',
      year: '',
      stage: ''
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  // Use filtered stats if available, otherwise use original stats
  const displayStats = filteredStats || stats;
  
  // Calculate percentage growth between stages
  const stage1Budget = typeof displayStats?.stage1Budget === 'string' ? parseInt(displayStats.stage1Budget.replace(/,/g, '')) : displayStats?.stage1Budget || 0;
  const stage2Budget = typeof displayStats?.stage2Budget === 'string' ? parseInt(displayStats.stage2Budget.replace(/,/g, '')) : displayStats?.stage2Budget || 0;
  const stage1Projects = displayStats?.stage1Projects || 0;
  const stage2Projects = displayStats?.stage2Projects || 0;
  
  const budgetGrowth = stage1Budget > 0 ? ((stage2Budget - stage1Budget) / stage1Budget * 100).toFixed(1) : 0;
  const projectsGrowth = stage1Projects > 0 ? ((stage2Projects - stage1Projects) / stage1Projects * 100).toFixed(1) : 0;

  const chartData = displayStats ? [
    { 
      name: 'Stage 1', 
      projects: stage1Projects, 
      budget: stage1Budget,
      budgetLabel: `Budget: ${stage1Budget.toLocaleString()} EGP`,
      projectsLabel: `Projects: ${stage1Projects}`,
      growth: 'Baseline'
    },
    { 
      name: 'Stage 2', 
      projects: stage2Projects, 
      budget: stage2Budget,
      budgetLabel: `Budget: ${stage2Budget.toLocaleString()} EGP`,
      projectsLabel: `Projects: ${stage2Projects}`,
      growth: `${budgetGrowth > 0 ? '+' : ''}${budgetGrowth}%`
    }
  ] : [];

  const donorTypeData = displayStats ? [
    { name: 'International', value: displayStats.internationalDonors, color: BRAND_COLORS.primary },
    { name: 'National', value: displayStats.nationalDonors, color: BRAND_COLORS.secondary }
  ] : [];

  // Calculate year-over-year growth
  const yearChartData = displayStats ? Object.keys(displayStats.yearStats).map((year, index, years) => {
    const currentYear = displayStats.yearStats[year];
    const currentBudget = typeof currentYear.budget === 'string' 
      ? parseInt(currentYear.budget.replace(/,/g, ''))
      : currentYear.budget;
    const currentProjects = currentYear.count;
    
    // Calculate growth from previous year
    let budgetGrowth = 0;
    let projectsGrowth = 0;
    
    if (index > 0) {
      const prevYear = years[index - 1];
      const prevYearData = displayStats.yearStats[prevYear];
      const prevBudget = typeof prevYearData.budget === 'string' 
        ? parseInt(prevYearData.budget.replace(/,/g, ''))
        : prevYearData.budget;
      const prevProjects = prevYearData.count;
      
      budgetGrowth = prevBudget > 0 ? ((currentBudget - prevBudget) / prevBudget * 100).toFixed(1) : 0;
      projectsGrowth = prevProjects > 0 ? ((currentProjects - prevProjects) / prevProjects * 100).toFixed(1) : 0;
    }
    
    return {
      year,
      projects: currentProjects,
      budget: currentBudget,
      budgetLabel: `Budget: ${currentBudget.toLocaleString()} EGP`,
      projectsLabel: `Projects: ${currentProjects}`,
      growth: index === 0 ? 'Baseline' : `${budgetGrowth > 0 ? '+' : ''}${budgetGrowth}%`
    };
  }).sort((a, b) => a.year - b.year) : [];

  const uniqueDonors = [...new Set(projects.map(p => p.donor))];
  const uniqueYears = [...new Set(projects.map(p => p.year))].sort();
  const uniqueStages = [...new Set(projects.map(p => p.stage))];

  const FilterButtons = ({ title, options, value, onChange, field, icon }) => (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1, color: BRAND_COLORS.primary, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
        {icon} {title}
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
        <Button
          variant={value === '' ? 'contained' : 'outlined'}
          size="small"
          onClick={() => onChange(field, '')}
          sx={{
            backgroundColor: value === '' ? BRAND_COLORS.primary : 'transparent',
            color: value === '' ? 'white' : BRAND_COLORS.primary,
            borderColor: BRAND_COLORS.primary,
            minWidth: 'auto',
            px: 1.5,
            py: 0.5,
            fontSize: '0.75rem',
            '&:hover': {
              backgroundColor: value === '' ? BRAND_COLORS.primary : BRAND_COLORS.primary + '20'
            }
          }}
        >
          All
        </Button>
        {options.map(option => (
          <Button
            key={option}
            variant={value === option ? 'contained' : 'outlined'}
            size="small"
            onClick={() => onChange(field, option)}
            sx={{
              backgroundColor: value === option ? BRAND_COLORS.primary : 'transparent',
              color: value === option ? 'white' : BRAND_COLORS.primary,
              borderColor: BRAND_COLORS.primary,
              minWidth: 'auto',
              px: 1.5,
              py: 0.5,
              fontSize: '0.75rem',
              '&:hover': {
                backgroundColor: value === option ? BRAND_COLORS.primary : BRAND_COLORS.primary + '20'
              }
            }}
          >
            {option}
          </Button>
        ))}
      </Box>
    </Box>
  );

  const FiltersDrawer = () => (
    <Drawer
      anchor="right"
      open={filtersOpen}
      onClose={() => setFiltersOpen(false)}
      PaperProps={{
        sx: {
          width: isMobile ? '100%' : 400,
          backgroundColor: '#f8f9fa'
        }
      }}
    >
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" sx={{ color: BRAND_COLORS.primary, fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
            <FilterList sx={{ mr: 1 }} />
            Filters & Search
          </Typography>
          <IconButton onClick={() => setFiltersOpen(false)}>
            <Close />
          </IconButton>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Search Projects/Donors"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: BRAND_COLORS.lightText }} />
            }}
            size="small"
          />
        </Box>

        {/* Filter Buttons */}
        <FilterButtons 
          title="Filter by Year" 
          options={uniqueYears} 
          value={filters.year} 
          onChange={handleFilterChange} 
          field="year"
          icon={<CalendarToday sx={{ fontSize: '1rem', mr: 0.5 }} />}
        />
        
        <FilterButtons 
          title="Filter by Stage" 
          options={uniqueStages} 
          value={filters.stage} 
          onChange={handleFilterChange} 
          field="stage"
          icon={<Layers sx={{ fontSize: '1rem', mr: 0.5 }} />}
        />
        
        <FilterButtons 
          title="Filter by Donor" 
          options={uniqueDonors} 
          value={filters.donor} 
          onChange={handleFilterChange} 
          field="donor"
          icon={<People sx={{ fontSize: '1rem', mr: 0.5 }} />}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={clearFilters}
            startIcon={<Clear />}
            sx={{ color: BRAND_COLORS.primary, borderColor: BRAND_COLORS.primary }}
          >
            Clear All Filters
          </Button>
          <Chip 
            label={`${filteredProjects.length} of ${projects.length} projects`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>
    </Drawer>
  );

  const activeFiltersCount = Object.values(filters).filter(f => f !== '').length;

  return (
    <Box sx={{ flexGrow: 1, backgroundColor: '#f5f5f5', minHeight: '100vh', overflowX: 'hidden' }}>
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: BRAND_COLORS.background,
          backdropFilter: filtersHover ? 'blur(10px)' : 'none',
          transition: 'backdrop-filter 0.3s ease'
        }}
        onMouseEnter={() => setFiltersHover(true)}
        onMouseLeave={() => setFiltersHover(false)}
      >
        <Toolbar>
          <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
            <Logo size={isMobile ? "small" : "medium"} color="white" />
            <Typography 
              variant={isMobile ? "body1" : "h6"} 
              component="div" 
              sx={{ color: 'white', fontWeight: 'bold', ml: isMobile ? 1 : 2 }}
            >
              Life Makers Foundation Funds
            </Typography>
          </Box>
          
          <Typography variant="body2" sx={{ mr: 2, color: 'white' }}>
            Welcome, {user?.username}
          </Typography>
          
          <Tooltip title="Filters & Search">
            <IconButton 
              color="inherit" 
              onClick={() => setFiltersOpen(true)}
              sx={{ mr: 1 }}
            >
              <Badge badgeContent={activeFiltersCount} color="error">
                <FilterAlt />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Sticky Filter Bar */}
      <Box sx={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        backgroundColor: '#f8f9fa',
        borderBottom: '1px solid #e0e0e0',
        py: 1,
        px: { xs: 1, sm: 2 }
      }}>
        <Container maxWidth="xl">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" sx={{ color: BRAND_COLORS.primary, fontWeight: 'bold', mr: 1 }}>
              Active Filters:
            </Typography>
            {filters.search && (
              <Chip 
                label={`Search: "${filters.search}"`} 
                size="small" 
                onDelete={() => handleFilterChange('search', '')}
                sx={{ backgroundColor: BRAND_COLORS.primary, color: 'white' }}
              />
            )}
            {filters.year && (
              <Chip 
                label={`Year: ${filters.year}`} 
                size="small" 
                onDelete={() => handleFilterChange('year', '')}
                sx={{ backgroundColor: BRAND_COLORS.secondary, color: 'white' }}
              />
            )}
            {filters.stage && (
              <Chip 
                label={`Stage: ${filters.stage}`} 
                size="small" 
                onDelete={() => handleFilterChange('stage', '')}
                sx={{ backgroundColor: BRAND_COLORS.success, color: 'white' }}
              />
            )}
            {filters.donor && (
              <Chip 
                label={`Donor: ${filters.donor}`} 
                size="small" 
                onDelete={() => handleFilterChange('donor', '')}
                sx={{ backgroundColor: BRAND_COLORS.warning, color: 'white' }}
              />
            )}
            {activeFiltersCount > 0 && (
              <Button 
                size="small" 
                onClick={clearFilters}
                sx={{ ml: 'auto', color: BRAND_COLORS.primary }}
              >
                Clear All
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          <b>Stage 1:</b> 2018-2020 &nbsp; | &nbsp; <b>Stage 2:</b> 2021-2025
        </Alert>
        {displayStats && (
          <>
            {/* Statistics Cards */}
            <Box sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 1.5, 
              mb: 3, 
              width: '100%',
              justifyContent: 'space-between'
            }}>
                <Card sx={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.background} 100%)`,
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  minHeight: isMobile ? 100 : 120,
                  flex: '1 1 180px'
                }}>
                  <CardContent sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Assignment sx={{ fontSize: '1.8rem', mr: 1, opacity: 0.9 }} />
                      <Typography variant={isMobile ? "body2" : "h6"} sx={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', fontWeight: 'bold' }}>
                        Total Projects
                      </Typography>
                    </Box>
                    <Typography variant={isMobile ? "h4" : "h3"} component="div" sx={{ fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                      {displayStats.totalProjects || '-'}
                    </Typography>
                  </CardContent>
                </Card>
              
                              <Card sx={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.secondary} 0%, #FFB74D 100%)`,
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  minHeight: isMobile ? 100 : 120,
                  flex: '1 1 180px'
                }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <AccountBalance sx={{ fontSize: '1.8rem', mr: 1, opacity: 0.9 }} />
                    <Typography variant={isMobile ? "body2" : "h6"} sx={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', fontWeight: 'bold' }}>
                      Total Budget (EGP)
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? "h4" : "h3"} component="div" sx={{ fontWeight: 'bold', fontSize: 'clamp(1.2rem, 3vw, 2rem)' }}>
                    {displayStats.totalBudget || '-'}
                  </Typography>
                </CardContent>
              </Card>
              
                              <Card sx={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.success} 0%, #66BB6A 100%)`,
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  minHeight: isMobile ? 100 : 120,
                  flex: '1 1 180px'
                }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Group sx={{ fontSize: '1.8rem', mr: 1, opacity: 0.9 }} />
                    <Typography variant={isMobile ? "body2" : "h6"} sx={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', fontWeight: 'bold' }}>
                      Unique Donors
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? "h4" : "h3"} component="div" sx={{ fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                    {displayStats.uniqueDonors || '-'}
                  </Typography>
                </CardContent>
              </Card>
              
                              <Card sx={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.warning} 0%, #FFA726 100%)`,
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  minHeight: isMobile ? 100 : 120,
                  flex: '1 1 180px'
                }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Public sx={{ fontSize: '1.8rem', mr: 1, opacity: 0.9 }} />
                    <Typography variant={isMobile ? "body2" : "h6"} sx={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', fontWeight: 'bold' }}>
                      International
                    </Typography>
                  </Box>
                  <Typography variant={isMobile ? "h4" : "h3"} component="div" sx={{ fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                    {displayStats.internationalDonors || '-'}
                  </Typography>
                </CardContent>
              </Card>

                              <Card sx={{ 
                  background: `linear-gradient(135deg, ${BRAND_COLORS.error} 0%, #EF5350 100%)`,
                  color: 'white',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                  height: '100%',
                  minHeight: isMobile ? 100 : 120,
                  flex: '1 1 180px'
                }}>
                <CardContent sx={{ p: isMobile ? 1.5 : 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Flag sx={{ fontSize: '1.8rem', mr: 1, opacity: 0.9 }} />
                    <Typography variant={isMobile ? "body2" : "h6"} sx={{ fontSize: 'clamp(0.75rem, 1.8vw, 0.9rem)', fontWeight: 'bold' }}>
                      National
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant={isMobile ? "h4" : "h3"} component="div" sx={{ fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                      {displayStats.nationalDonors || '-'}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Box>

            {/* Tabs for different views */}
            <Card sx={{ mb: 4 }}>
              <Tabs 
                value={activeTab} 
                onChange={(e, newValue) => setActiveTab(newValue)}
                variant={isMobile ? "scrollable" : "fullWidth"}
                scrollButtons={isMobile ? "auto" : false}
                sx={{ 
                  borderBottom: 1, 
                  borderColor: 'divider',
                  '& .MuiTab-root': { color: BRAND_COLORS.text, fontSize: isMobile ? '0.8rem' : '1rem' }
                }}
              >
                <Tab label="Overview" icon={<Analytics />} />
                <Tab label="Trends & Insights" icon={<TrendingUp />} />
                <Tab label="Comparisons" icon={<Compare />} />
                <Tab label="Projects Data" icon={<FilterList />} />
              </Tabs>

              <Box sx={{ p: isMobile ? 2 : 3 }}>
                {activeTab === 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Card sx={{ flex: '1 1 400px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: BRAND_COLORS.primary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                          Projects by Stage
                        </Typography>
                                                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                            <BarChart data={chartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis tickFormatter={(value) => value.toLocaleString()} />
                              <RechartsTooltip 
                                formatter={(value, name) => [
                                  name === 'Budget (EGP)' ? `${value.toLocaleString()} EGP` : value,
                                  name
                                ]}
                                labelFormatter={(label) => `${label} (${chartData.find(d => d.name === label)?.growth})`}
                              />
                              <Legend />
                              <Bar dataKey="projects" fill={BRAND_COLORS.primary} name="Projects" label={{ position: 'top', fill: BRAND_COLORS.primary, fontWeight: 'bold', fontSize: 14 }}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={BRAND_COLORS.primary} />
                                ))}
                              </Bar>
                              <Bar dataKey="budget" fill={BRAND_COLORS.secondary} name="Budget (EGP)" label={{ position: 'top', fill: BRAND_COLORS.secondary, fontWeight: 'bold', fontSize: 14, formatter: (v) => v.toLocaleString() + ' EGP' }}>
                                {chartData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={BRAND_COLORS.secondary} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            <b>Stage 1:</b> 2018-2020 &nbsp; | &nbsp; <b>Stage 2:</b> 2021-2025
                          </Typography>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ flex: '1 1 400px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: BRAND_COLORS.primary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                          Donor Types Distribution
                        </Typography>
                                                  <ResponsiveContainer width="100%" height={isMobile ? 200 : 250}>
                            <PieChart>
                              <Pie
                                data={donorTypeData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, value, percent }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
                                outerRadius={isMobile ? 50 : 70}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {donorTypeData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <RechartsTooltip 
                                formatter={(value, name) => [value, name]}
                                labelFormatter={(label) => `${label} Donors`}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {activeTab === 1 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Card sx={{ flex: '2 1 600px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: BRAND_COLORS.primary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                          Projects & Budget Trends by Year
                        </Typography>
                                                  <ResponsiveContainer width="100%" height={isMobile ? 250 : 350}>
                            <AreaChart data={yearChartData} margin={{ left: 20, right: 20, top: 20, bottom: 20 }}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="year" />
                              <YAxis tickFormatter={(value) => value.toLocaleString()} />
                              <RechartsTooltip 
                                formatter={(value, name) => [
                                  name === 'Budget (EGP)' ? `${value.toLocaleString()} EGP` : value,
                                  name
                                ]}
                                labelFormatter={(label) => `${label} (${yearChartData.find(d => d.year === label)?.growth})`}
                              />
                              <Legend />
                              <Area 
                                type="monotone" 
                                dataKey="projects" 
                                stackId="1"
                                stroke={BRAND_COLORS.primary} 
                                fill={BRAND_COLORS.primary} 
                                fillOpacity={0.6}
                                name="Projects" 
                              />
                              <Area 
                                type="monotone" 
                                dataKey="budget" 
                                stackId="2"
                                stroke={BRAND_COLORS.secondary} 
                                fill={BRAND_COLORS.secondary} 
                                fillOpacity={0.6}
                                name="Budget (EGP)" 
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                      </CardContent>
                    </Card>
                    <Box sx={{ flex: '1 1 300px' }}>
                      <Insights stats={displayStats} projects={filteredProjects} />
                    </Box>
                  </Box>
                )}

                {activeTab === 2 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    <Card sx={{ flex: '1 1 400px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: BRAND_COLORS.primary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                          Stage Comparison
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 3 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: BRAND_COLORS.success, fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                              {displayStats.stage1Projects || '-'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                              Stage 1 Projects
                            </Typography>
                            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: BRAND_COLORS.success, fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)' }}>
                              {displayStats.stage1Budget || '-'}
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: BRAND_COLORS.warning, fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                              {displayStats.stage2Projects || '-'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                              Stage 2 Projects
                            </Typography>
                            <Typography variant={isMobile ? "body1" : "h6"} sx={{ color: BRAND_COLORS.warning, fontSize: 'clamp(0.875rem, 2.5vw, 1.25rem)' }}>
                              {displayStats.stage2Budget || '-'}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            <b>Projects Growth:</b> {projectsGrowth}% &nbsp; | &nbsp; <b>Budget Growth:</b> {budgetGrowth}%
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                    
                    <Card sx={{ flex: '1 1 400px' }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom sx={{ color: BRAND_COLORS.primary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                          Donor Type Comparison
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', mt: 3 }}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: BRAND_COLORS.primary, fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                              {displayStats.internationalDonors || '-'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                              International
                            </Typography>
                          </Box>
                          <Divider orientation="vertical" flexItem />
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant={isMobile ? "h5" : "h4"} sx={{ color: BRAND_COLORS.secondary, fontWeight: 'bold', fontSize: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
                              {displayStats.nationalDonors || '-'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                              National
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {activeTab === 3 && (
                  <Box>
                    {/* Projects Table */}
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 1 }}>
                          <Typography variant="h6" sx={{ color: BRAND_COLORS.primary, fontSize: 'clamp(1rem, 2.5vw, 1.25rem)' }}>
                            Projects Data ({filteredProjects.length} projects)
                          </Typography>
                          <Box>
                            <Tooltip title="Export Data">
                              <IconButton sx={{ color: BRAND_COLORS.primary }}>
                                <Download />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Refresh">
                              <IconButton sx={{ color: BRAND_COLORS.primary }}>
                                <Refresh />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        
                        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                          <Table stickyHeader size={isMobile ? "small" : "medium"}>
                            <TableHead>
                              <TableRow>
                                <TableCell 
                                  onClick={() => handleSort('project')}
                                  sx={{ cursor: 'pointer', backgroundColor: BRAND_COLORS.primary, color: 'white', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Project
                                    <Sort sx={{ ml: 1 }} />
                                  </Box>
                                </TableCell>
                                <TableCell 
                                  onClick={() => handleSort('donor')}
                                  sx={{ cursor: 'pointer', backgroundColor: BRAND_COLORS.primary, color: 'white', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Donor
                                    <Sort sx={{ ml: 1 }} />
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ backgroundColor: BRAND_COLORS.primary, color: 'white', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>Type</TableCell>
                                <TableCell 
                                  onClick={() => handleSort('year')}
                                  sx={{ cursor: 'pointer', backgroundColor: BRAND_COLORS.primary, color: 'white', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Year
                                    <Sort sx={{ ml: 1 }} />
                                  </Box>
                                </TableCell>
                                <TableCell 
                                  onClick={() => handleSort('budgetEGP')}
                                  sx={{ cursor: 'pointer', backgroundColor: BRAND_COLORS.primary, color: 'white', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    Budget (EGP)
                                    <Sort sx={{ ml: 1 }} />
                                  </Box>
                                </TableCell>
                                <TableCell sx={{ backgroundColor: BRAND_COLORS.primary, color: 'white', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>Stage</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredProjects.map((project) => (
                                <TableRow key={project.id} hover>
                                  <TableCell sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>{project.project || '-'}</TableCell>
                                  <TableCell sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>{project.donor || '-'}</TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={project.type} 
                                      color={project.type === 'International' ? 'primary' : 'secondary'}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: project.type === 'International' ? BRAND_COLORS.primary : BRAND_COLORS.secondary,
                                        color: 'white',
                                        fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)'
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>{project.year || '-'}</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold', fontSize: 'clamp(0.75rem, 2vw, 1rem)' }}>
                                    {project.budgetEGP ? project.budgetEGP.toLocaleString() : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={project.stage} 
                                      color={project.stage === 'Stage1' ? 'success' : 'warning'}
                                      size="small"
                                      sx={{ 
                                        backgroundColor: project.stage === 'Stage1' ? BRAND_COLORS.success : BRAND_COLORS.warning,
                                        color: 'white',
                                        fontSize: 'clamp(0.7rem, 1.8vw, 0.875rem)'
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Box>
                )}
              </Box>
            </Card>
          </>
        )}
      </Container>

      {/* Filters Drawer */}
      <FiltersDrawer />

      {/* Floating Action Button for Mobile */}
      {isMobile && (
        <Fab
          color="primary"
          aria-label="filters"
          onClick={() => setFiltersOpen(true)}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            backgroundColor: BRAND_COLORS.primary
          }}
        >
          <Badge badgeContent={activeFiltersCount} color="error">
            <FilterAlt />
          </Badge>
        </Fab>
      )}
    </Box>
  );
}

export default App; 