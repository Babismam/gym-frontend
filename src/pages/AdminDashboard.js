import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { getDashboardStats } from '../services/gymService';
import PeopleIcon from '@mui/icons-material/People';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsIcon from '@mui/icons-material/Sports';

function StatCard({ title, value, icon, linkTo }) {
    return (
        <Grid item xs={12} sm={6} md={4}>
            <Paper 
                elevation={4} 
                sx={{ 
                    '&:hover': { 
                        transform: 'scale(1.03)',
                        boxShadow: 8,
                    },
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
            >
                <CardActionArea component={RouterLink} to={linkTo} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180 }}>
                    <Box sx={{ mb: 1.5 }}>{icon}</Box>
                    <Typography variant="h4" component="p" fontWeight="bold">
                        {value}
                    </Typography>
                    <Typography color="text.secondary">
                        {title}
                    </Typography>
                </CardActionArea>
            </Paper>
        </Grid>
    );
}

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await getDashboardStats();
                setStats(data);
            } catch (err) {
                setError("Αδυναμία φόρτωσης δεδομένων.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);
    
    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                🏆 Πίνακας Ελέγχου Διαχειριστή
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
                Κάντε κλικ σε μια κάρτα για διαχείριση:
            </Typography>

            {loading && <CircularProgress />}
            {error && <Alert severity="error">{error}</Alert>}
            
            {stats && (
                <Grid container spacing={4} sx={{ maxWidth: '960px', width: '100%', justifyContent: 'center' }}>
                    <StatCard 
                        title="Σύνολο Μελών" 
                        value={stats.memberCount} 
                        icon={<PeopleIcon sx={{ fontSize: 60 }} color="primary" />}
                        linkTo="/admin/members"
                    />
                    <StatCard 
                        title="Σύνολο Γυμναστών" 
                        value={stats.trainerCount} 
                        icon={<SportsIcon sx={{ fontSize: 60 }} color="secondary" />}
                        linkTo="/admin/trainers"
                    />
                    <StatCard 
                        title="Διαθέσιμα Προγράμματα" 
                        value={stats.programCount} 
                        icon={<FitnessCenterIcon sx={{ fontSize: 60 }} color="success" />}
                        linkTo="/admin/programs"
                    />
                </Grid>
            )}
        </Box>
    );
}