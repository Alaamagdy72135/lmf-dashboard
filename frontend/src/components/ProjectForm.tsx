import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
} from '@mui/material';
import axios from 'axios';

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: any;
  onSuccess: () => void;
}

const ProjectForm: React.FC<ProjectFormProps> = ({ open, onClose, project, onSuccess }) => {
  const [formData, setFormData] = useState({
    project: '',
    donor: '',
    type: '',
    year: new Date().getFullYear(),
    budgetEGP: 0,
    amountUSD: 0,
    note: '',
    uniqueProject: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (project) {
      setFormData({
        project: project.project || '',
        donor: project.donor || '',
        type: project.type || '',
        year: project.year || new Date().getFullYear(),
        budgetEGP: project.budgetEGP || 0,
        amountUSD: project.amountUSD || 0,
        note: project.note || '',
        uniqueProject: project.uniqueProject || '',
      });
    } else {
      setFormData({
        project: '',
        donor: '',
        type: '',
        year: new Date().getFullYear(),
        budgetEGP: 0,
        amountUSD: 0,
        note: '',
        uniqueProject: '',
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://lmf-dashboard.onrender.com/api';
      if (project) {
        // Update existing project
        await axios.put(`${API_URL}/api/projects/${project.id}`, formData);
      } else {
        // Add new project
        await axios.post(`${API_URL}/api/projects`, formData);
      }
      
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {project ? 'Edit Project' : 'Add New Project'}
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <TextField
              label="Project Name"
              value={formData.project}
              onChange={(e) => handleChange('project', e.target.value)}
              required
              fullWidth
              sx={{ minWidth: 300 }}
            />
            
            <TextField
              label="Donor"
              value={formData.donor}
              onChange={(e) => handleChange('donor', e.target.value)}
              required
              fullWidth
              sx={{ minWidth: 300 }}
            />
            
            <FormControl fullWidth sx={{ minWidth: 200 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => handleChange('type', e.target.value)}
                required
              >
                <MenuItem value="International">International</MenuItem>
                <MenuItem value="Corporate">Corporate</MenuItem>
                <MenuItem value="Government">Government</MenuItem>
                <MenuItem value="NGO">NGO</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              label="Year"
              type="number"
              value={formData.year}
              onChange={(e) => handleChange('year', parseInt(e.target.value))}
              required
              inputProps={{ min: 2018, max: 2025 }}
              sx={{ minWidth: 120 }}
            />
            
            <TextField
              label="Budget (EGP)"
              type="number"
              value={formData.budgetEGP}
              onChange={(e) => handleChange('budgetEGP', parseFloat(e.target.value) || 0)}
              sx={{ minWidth: 150 }}
            />
            
            <TextField
              label="Amount (USD)"
              type="number"
              value={formData.amountUSD}
              onChange={(e) => handleChange('amountUSD', parseFloat(e.target.value) || 0)}
              sx={{ minWidth: 150 }}
            />
            
            <TextField
              label="Unique Project ID"
              value={formData.uniqueProject}
              onChange={(e) => handleChange('uniqueProject', e.target.value)}
              placeholder="e.g., REF-001"
              sx={{ minWidth: 200 }}
            />
            
            <TextField
              label="Notes"
              value={formData.note}
              onChange={(e) => handleChange('note', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Stage:</strong> {formData.year < 2021 ? 'Stage 1' : 'Stage 2'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              <strong>Note:</strong> Projects before 2021 are Stage 1, 2021-2025 are Stage 2
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading || !formData.project || !formData.donor || !formData.type}
          >
            {loading ? 'Saving...' : (project ? 'Update Project' : 'Add Project')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ProjectForm; 