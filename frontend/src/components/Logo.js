import React from 'react';
import { Box, Typography } from '@mui/material';

const Logo = ({ size = 'medium', color = 'white' }) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: '1rem', height: 32 };
      case 'large':
        return { fontSize: '2rem', height: 64 };
      default:
        return { fontSize: '1.5rem', height: 48 };
    }
  };

  const sizeStyle = getSize();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', height: sizeStyle.height }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center',
        borderRight: `2px solid ${color}`,
        pr: 2,
        mr: 2
      }}>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            color: color,
            fontWeight: 'bold',
            fontSize: sizeStyle.fontSize,
            fontFamily: 'Arial, sans-serif'
          }}
        >
          LIFE
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: color,
            fontWeight: 'bold',
            fontSize: sizeStyle.fontSize * 0.6,
            lineHeight: 1
          }}
        >
          Makers
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#EE9933', // Orange accent
            fontWeight: 'bold',
            fontSize: sizeStyle.fontSize * 0.4,
            lineHeight: 1
          }}
        >
          EGYPT
        </Typography>
      </Box>
    </Box>
  );
};

export default Logo; 