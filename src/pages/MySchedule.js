import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getTrainerSchedule } from '../services/gymService';

const dayTranslations = { MONDAY: "Δευτέρα", TUESDAY: "Τρίτη", WEDNESDAY: "Τετάρτη", THURSDAY: "Πέμπτη", FRIDAY: "Παρασκευή", SATURDAY: "Σάββατο", SUNDAY: "Κυριακή" };
const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const programColors = {
    CrossFit: '#D32F2F', Yoga: '#1976D2', Pilates: '#388E3C', "Body Pump": '#FBC02D',
    TRX: '#7B1FA2', Zumba: '#E64A19', Spinning: '#00796B', Default: '#546E7A'
};

export default function MySchedule() {
    const { user } = useAuth();
    const [timeSlots, setTimeSlots] = useState([]);
    const [scheduleTable, setScheduleTable] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user?.id) { setLoading(false); return; }
        
        try {
            const scheduleData = await getTrainerSchedule(user.id);
            
            const uniqueTimes = [...new Set(scheduleData.map(item => item.startTime))].sort();
            setTimeSlots(uniqueTimes);

            const tableData = scheduleData.reduce((acc, item) => {
                const day = item.dayOfWeek;
                const time = item.startTime;
                if (!acc[day]) acc[day] = {};
                acc[day][time] = item;
                return acc;
            }, {});
            setScheduleTable(tableData);

        } catch (err) {
            setError("Αδυναμία φόρτωσης του προγράμματός σας.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                Το Εβδομαδιαίο μου Πρόγραμμα
            </Typography>
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="personal weekly schedule">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold', borderRight: '2px solid black', borderBottom: '2px solid black' }}>Ώρα</TableCell>
                            {dayOrder.map((day, index) => (
                                <TableCell key={day} align="center" sx={{ fontWeight: 'bold', borderBottom: '2px solid black', borderRight: index < dayOrder.length - 1 ? '1px solid rgba(224, 224, 224, 1)' : 'none' }}>
                                    {dayTranslations[day]}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {timeSlots.length > 0 ? timeSlots.map(time => (
                            <TableRow key={time}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold', borderRight: '2px solid black' }}>
                                    {time}
                                </TableCell>
                                {dayOrder.map((day, index) => {
                                    const item = scheduleTable[day]?.[time];
                                    const cardColor = item ? (programColors[item.program.name] || programColors.Default) : 'transparent';
                                    
                                    return (
                                        <TableCell key={day} align="center" sx={{ verticalAlign: 'middle', p: 1, borderRight: index < dayOrder.length - 1 ? '1px solid rgba(224, 224, 224, 1)' : 'none' }}>
                                            {item ? (
                                                <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: cardColor, color: 'white', height: '100%' }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{item.program.name}</Typography>
                                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>
                                                        Συμμετοχές: {item.attendanceCount} / {item.program.maxParticipants}
                                                    </Typography>
                                                </Paper>
                                            ) : null}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography sx={{ p: 4, color: 'text.secondary' }}>Δεν έχετε ανατεθειμένα μαθήματα στο πρόγραμμα.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}