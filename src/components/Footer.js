import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, CircularProgress } from '@mui/material';
import { getOpeningHours } from '../services/gymService';

const dayTranslations = { MONDAY: "Δευτέρα", TUESDAY: "Τρίτη", WEDNESDAY: "Τετάρτη", THURSDAY: "Πέμπτη", FRIDAY: "Παρασκευή", SATURDAY: "Σάββατο", SUNDAY: "Κυριακή" };
const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function Footer() {
    const [groupedHours, setGroupedHours] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHours = async () => {
            try {
                const data = await getOpeningHours();
                const processedHours = data.reduce((acc, item) => {
                    const day = item.dayOfWeek;
                    if (!acc[day]) acc[day] = [];
                    acc[day].push(`${item.openTime} - ${item.closeTime}`);
                    return acc;
                }, {});
                setGroupedHours(processedHours);
            } catch (error) {
                console.error("Failed to fetch opening hours:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHours();
    }, []);

    return (
        <Paper component="footer" square variant="outlined" sx={{ backgroundColor: '#212121', color: 'white', py: 5 }}>
            <Container maxWidth="lg">
                <Grid container spacing={5} justifyContent="center">
                    <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>Επικοινωνία</Typography>
                        <Typography>Οδός Γυμναστηρίου 123, Αθήνα, Ελλάδα</Typography>
                        <Typography>+30 210 123 4567</Typography>
                        <Typography>contact@gymsystem.com</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6} md={4} sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" gutterBottom>Ωράριο Λειτουργίας</Typography>
                        {loading ? <CircularProgress color="inherit" size={24} /> : (
                            dayOrder.map(day => (
                                <Typography key={day}>
                                    {`${dayTranslations[day]}: `}
                                    {groupedHours[day] ? groupedHours[day].join(' & ') : 'Κλειστά'}
                                </Typography>
                            ))
                        )}
                    </Grid>
                </Grid>
                <Box mt={5}>
                    <Typography variant="body2" align="center">
                        {'Πνευματικά Δικαιώματα © '}
                        Σύστημα Διαχείρισης Γυμναστηρίου {new Date().getFullYear()}
                        {'.'}
                    </Typography>
                </Box>
            </Container>
        </Paper>
    );
}