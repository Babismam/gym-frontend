import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';

export default function HeroSection({ isLoggedIn }) {
  return (
    <Box 
      sx={{ 
        height: '70vh', 
        backgroundImage: 'url(https://images.unsplash.com/photo-1581009137042-c552e485697a?q=80&w=2070)', 
        backgroundSize: 'cover', 
        backgroundPosition: 'center',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'white',
        textAlign: 'center',
        p: 2
      }}
    >
      <Box sx={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', p: 4, borderRadius: 2 }}>
        <Typography variant="h2" component="h1" fontWeight="bold" gutterBottom>
          Άλλαξε το Σώμα σου, Άλλαξε τον Τρόπο Σκέψης σου
        </Typography>
        
        {!isLoggedIn && (
          <>
            <Typography variant="h5" paragraph sx={{ my: 3 }}>
              Έλα μαζί μας και ανακάλυψε τις πραγματικές σου δυνατότητες.
            </Typography>
            <Button variant="contained" size="large" color="primary" component={Link} to="/register">
              Γίνε Μέλος
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}