import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Tooltip } from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

export default function Navbar() {
  const navigate = useNavigate();
  const { isLoggedIn, user, handleLogout } = useAuth();

  const onLogoutClick = () => {
    handleLogout();
    navigate("/login");
  };

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
          <Tooltip title="Αρχική Σελίδα">
            <IconButton component={Link} to="/" color="inherit" edge="start">
              <HomeIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <FitnessCenterIcon sx={{ mr: 1 }} />
          <Typography variant="h6" component="div">
            Διαχείριση Γυμναστηρίου
          </Typography>
        </Box>

        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {isLoggedIn && user && (
            <>
              <Tooltip title="Ο Πίνακας Ελέγχου μου">
                <IconButton component={Link} to={dashboardUrl} color="inherit">
                  <DashboardIcon />
                </IconButton>
              </Tooltip>
              
              <Typography sx={{ mx: 2, display: { xs: 'none', sm: 'block' } }}>
                Καλώς ήρθες, {user.firstName}
              </Typography>
              
              <Button color="inherit" onClick={onLogoutClick}>
                Έξοδος
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}