import React from 'react';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';

export default function PublicNavbar() {
  const { isLoggedIn, user } = useAuth();

  let dashboardUrl = "/";
  if (user) {
    switch (user.role) {
      case 'ADMIN':
        dashboardUrl = "/admin-dashboard";
        break;
      case 'TRAINER':
        dashboardUrl = "/trainer-dashboard";
        break;
      case 'MEMBER':
        dashboardUrl = "/member-dashboard";
        break;
      default:
        dashboardUrl = "/";
    }
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-start' }}>
          <IconButton component={Link} to="/" color="inherit" edge="start">
            <HomeIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Gym Management
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          {isLoggedIn ? (
            <Tooltip title="My Dashboard">
              <IconButton component={Link} to={dashboardUrl} color="inherit">
                <DashboardIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Button component={Link} to="/login" color="inherit">
              Είσοδος / Εγγραφή
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}