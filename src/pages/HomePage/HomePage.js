import React from 'react';
import { Box, Container } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

import PublicNavbar from '../../components/PublicNavbar';
import Footer from '../../components/Footer';
import HeroSection from './HeroSection';
import ProgramsSection from './ProgramsSection';
import TrainersSection from './TrainersSection';

export default function HomePage() {
  const { isLoggedIn } = useAuth();

  return (
    <Box>
      <PublicNavbar />
      <HeroSection isLoggedIn={isLoggedIn} />
      <Container maxWidth="lg">
        <ProgramsSection />
      </Container>
      <TrainersSection />
      <Footer />
    </Box>
  );
}