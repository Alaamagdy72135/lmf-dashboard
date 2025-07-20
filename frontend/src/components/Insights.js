import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider
} from '@mui/material';
import {
  TrendingUp,
  Star,
  Warning,
  CheckCircle,
  Info
} from '@mui/icons-material';

const Insights = ({ stats, projects }) => {
  if (!stats || !projects) return null;

  const insights = [];

  // Calculate insights
  const totalBudget = projects.reduce((sum, p) => sum + p.budgetEGP, 0);
  const avgBudget = totalBudget / projects.length;
  
  // Top donors by budget
  const donorBudgets = projects.reduce((acc, project) => {
    acc[project.donor] = (acc[project.donor] || 0) + project.budgetEGP;
    return acc;
  }, {});
  
  const topDonors = Object.entries(donorBudgets)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  // Year over year growth (only positive)
  const yearData = projects.reduce((acc, project) => {
    if (!acc[project.year]) acc[project.year] = { count: 0, budget: 0 };
    acc[project.year].count++;
    acc[project.year].budget += project.budgetEGP;
    return acc;
  }, {});

  const years = Object.keys(yearData).sort();
  if (years.length >= 2) {
    const latestYear = years[years.length - 1];
    const previousYear = years[years.length - 2];
    const growth = ((yearData[latestYear].budget - yearData[previousYear].budget) / yearData[previousYear].budget * 100).toFixed(1);
    
    if (growth > 5) {
      insights.push({
        type: 'positive',
        icon: <TrendingUp />,
        title: `Growth in ${latestYear}`,
        description: `${growth}% increase in budget compared to ${previousYear}`,
        color: 'success'
      });
    }
  }

  // Stage distribution insight
  const stage1Count = projects.filter(p => p.stage === 'Stage1').length;
  const stage2Count = projects.filter(p => p.stage === 'Stage2').length;
  const stageRatio = stage2Count / stage1Count;
  
  if (stageRatio > 1.5) {
    insights.push({
      type: 'info',
      icon: <Info />,
      title: 'Strong Stage 2 Focus',
      description: `${stage2Count} Stage 2 projects vs ${stage1Count} Stage 1 projects`,
      color: 'info'
    });
  }

  // International vs National insight
  const internationalCount = projects.filter(p => p.type === 'International').length;
  const nationalCount = projects.filter(p => p.type === 'National').length;
  const internationalRatio = internationalCount / (internationalCount + nationalCount);
  
  if (internationalRatio > 0.6) {
    insights.push({
      type: 'positive',
      icon: <Star />,
      title: 'Strong International Presence',
      description: `${(internationalRatio * 100).toFixed(0)}% of projects are international`,
      color: 'primary'
    });
  }

  // Top donor insight
  if (topDonors.length > 0) {
    const [topDonor, topBudget] = topDonors[0];
    const topDonorPercentage = ((topBudget / totalBudget) * 100).toFixed(1);
    
    if (topDonorPercentage > 50) {
      insights.push({
        type: 'warning',
        icon: <Warning />,
        title: 'Concentration Risk',
        description: `${topDonor} represents ${topDonorPercentage}% of total budget`,
        color: 'warning'
      });
    }
  }

  // Average budget insight
  if (avgBudget > 20000000) {
    insights.push({
      type: 'positive',
      icon: <CheckCircle />,
      title: 'High-Value Projects',
      description: `Average project budget: ${avgBudget.toLocaleString()} EGP`,
      color: 'success'
    });
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom sx={{ color: '#224466', fontWeight: 'bold' }}>
          📊 Key Insights & Trends
        </Typography>
        
        <List>
          {insights.map((insight, index) => (
            <React.Fragment key={index}>
              <ListItem alignItems="flex-start">
                <ListItemIcon sx={{ color: insight.color }}>
                  {insight.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        {insight.title}
                      </Typography>
                      <Chip 
                        label={insight.type} 
                        size="small" 
                        color={insight.color}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Typography variant="body2" color="text.secondary">
                      {insight.description}
                    </Typography>
                  }
                />
              </ListItem>
              {index < insights.length - 1 && <Divider variant="inset" component="li" />}
            </React.Fragment>
          ))}
        </List>

        {insights.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            No significant trends detected. Data appears to be well-balanced.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default Insights; 