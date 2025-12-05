import React, { useState, useEffect } from 'react';
import { Box, Typography, Grid, Paper, CircularProgress, Alert, CardActionArea } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTrainerSchedule, getTrainerAssignedPrograms, getTrainerDetails } from '../services/gymService';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';

function StatCard({ title, value, icon, linkTo }) {
    return (
        <Grid item xs={12} sm={6}>
            <Paper 
                elevation={4} 
                sx={{ 
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 8 },
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
            >
                <CardActionArea component={RouterLink} to={linkTo} sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180 }}>
                    <Box sx={{ mb: 1.5 }}>{icon}</Box>
                    <Typography variant="h4" component="p" fontWeight="bold">{value}</Typography>
                    <Typography color="text.secondary">{title}</Typography>
                </CardActionArea>
            </Paper>
        </Grid>
    );
}

export default function TrainerDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [trainerDetails, setTrainerDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        
        const fetchStats = async () => {
            try {
                const [scheduleData, programsData, userData] = await Promise.all([
                    getTrainerSchedule(user.id),
                    getTrainerAssignedPrograms(user.id),
                    getTrainerDetails(user.id)
                ]);
                
                setStats({
                    weeklyClasses: scheduleData.length,
                    assignedPrograms: programsData.length
                });
                setTrainerDetails(userData);
            } catch (err) {
                setError("Αδυναμία φόρτωσης δεδομένων.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [user]);
    
    return (
        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
            <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
                💪 Πίνακας Ελέγχου Γυμναστή
            </Typography>
            <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
                Καλώς ήρθες, {user ? user.firstName : 'Coach'}! Κάνε κλικ σε μια κάρτα για διαχείριση:
            </Typography>

            {loading && <CircularProgress />}
            {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
            
            {!trainerDetails?.isActive && (
                <Alert severity="warning" sx={{ width: '100%', maxWidth: '700px', mb: 2 }}>
                    Ο λογαριασμός σας είναι ανενεργός. Παρακαλούμε επικοινωνήστε με τη διαχείριση.
                </Alert>
            )}

            {stats && trainerDetails?.isActive && (
                <Grid container spacing={4} sx={{ maxWidth: '700px', width: '100%', justifyContent: 'center' }}>
                    <StatCard 
                        title="Εβδομαδιαία Μαθήματα" 
                        value={stats.weeklyClasses} 
                        icon={<CalendarMonthIcon sx={{ fontSize: 60 }} color="primary" />}
                        linkTo="/trainer/schedule"
                    />
                    <StatCard 
                        title="Ανατεθειμένα Προγράμματα" 
                        value={stats.assignedPrograms} 
                        icon={<FitnessCenterIcon sx={{ fontSize: 60 }} color="secondary" />}
                        linkTo="/trainer/programs"
                    />
                </Grid>
            )}
        </Box>
    );
}