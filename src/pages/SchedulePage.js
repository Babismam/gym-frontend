import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Snackbar } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getFullSchedule, getMyAttendance, bookClass, cancelClass, getOpeningHours, getMemberDetails } from '../services/gymService';

const dayTranslations = { MONDAY: "Δευτέρα", TUESDAY: "Τρίτη", WEDNESDAY: "Τετάρτη", THURSDAY: "Πέμπτη", FRIDAY: "Παρασκευή", SATURDAY: "Σάββατο", SUNDAY: "Κυριακή" };
const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const programColors = {
    CrossFit: '#D32F2F', Yoga: '#1976D2', Pilates: '#388E3C', "Body Pump": '#FBC02D',
    TRX: '#7B1FA2', Zumba: '#E64A19', Spinning: '#00796B', Default: '#546E7A'
};

export default function SchedulePage() {
    const { user } = useAuth();
    const [timeSlots, setTimeSlots] = useState([]);
    const [scheduleTable, setScheduleTable] = useState({});
    const [openingHours, setOpeningHours] = useState({});
    const [myBookings, setMyBookings] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
    const [confirmation, setConfirmation] = useState({ open: false, title: '', content: '', onConfirm: () => {} });
    const [memberDetails, setMemberDetails] = useState(null);

    useEffect(() => {
        if (!user?.id) { setLoading(false); return; }
        const fetchData = async () => {
            setLoading(true);
            try {
                const [scheduleData, attendanceData, openingHoursData, memberData] = await Promise.all([
                    getFullSchedule(),
                    getMyAttendance(user.id),
                    getOpeningHours(),
                    getMemberDetails(user.id)
                ]);
                
                const uniqueTimes = [...new Set(scheduleData.map(item => item.startTime))].sort();
                setTimeSlots(uniqueTimes);

                const tableData = scheduleData.reduce((acc, item) => {
                    if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = {};
                    acc[item.dayOfWeek][item.startTime] = item;
                    return acc;
                }, {});
                setScheduleTable(tableData);

                const hoursData = openingHoursData.reduce((acc, item) => {
                    if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = [];
                    acc[item.dayOfWeek].push({ start: item.openTime, end: item.closeTime });
                    return acc;
                }, {});
                setOpeningHours(hoursData);

                setMyBookings(new Set(attendanceData.map(att => att.schedule?.id).filter(Boolean)));
                setMemberDetails(memberData);

            } catch (err) {
                setFeedback({ open: true, message: "Αδυναμία φόρτωσης του προγράμματος.", severity: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const refreshScheduleData = async () => {
        try {
            const [scheduleData, attendanceData, memberData] = await Promise.all([
                getFullSchedule(), getMyAttendance(user.id), getMemberDetails(user.id)
            ]);
            const tableData = scheduleData.reduce((acc, item) => {
                if (!acc[item.dayOfWeek]) acc[item.dayOfWeek] = {};
                acc[item.dayOfWeek][item.startTime] = item;
                return acc;
            }, {});
            setScheduleTable(tableData);
            setMyBookings(new Set(attendanceData.map(att => att.schedule?.id).filter(Boolean)));
            setMemberDetails(memberData);
        } catch (err) {
            setFeedback({ open: true, message: "Αδυναμία ανανέωσης του προγράμματος.", severity: 'error' });
        }
    };

    const handleBookClass = async (item) => {
        setMyBookings(prev => new Set(prev).add(item.id));
        setScheduleTable(prevTable => {
            const newTable = JSON.parse(JSON.stringify(prevTable));
            newTable[item.dayOfWeek][item.startTime].attendanceCount++;
            return newTable;
        });
        try {
            await bookClass(user.id, item.id);
            setFeedback({ open: true, message: 'Η εγγραφή ήταν επιτυχής!', severity: 'success' });
        } catch (err) {
            setFeedback({ open: true, message: err.message || "Η εγγραφή απέτυχε.", severity: 'error' });
            await refreshScheduleData();
        }
    };

    const handleCancelClass = async (item) => {
        setMyBookings(prev => {
            const newBookings = new Set(prev);
            newBookings.delete(item.id);
            return newBookings;
        });
        setScheduleTable(prevTable => {
            const newTable = JSON.parse(JSON.stringify(prevTable));
            newTable[item.dayOfWeek][item.startTime].attendanceCount--;
            return newTable;
        });
        try {
            await cancelClass(user.id, item.id);
            setFeedback({ open: true, message: 'Η απεγγραφή ήταν επιτυχής!', severity: 'success' });
        } catch (err) {
            setFeedback({ open: true, message: err.message || "Η απεγγραφή απέτυχε.", severity: 'error' });
            await refreshScheduleData();
        }
    };

    const handleOpenConfirmation = (title, content, onConfirmAction) => {
        setConfirmation({ open: true, title, content, onConfirm: onConfirmAction });
    };
    const handleCloseConfirmation = () => {
        setConfirmation({ ...confirmation, open: false });
    };
    const handleConfirmAction = () => {
        confirmation.onConfirm();
        handleCloseConfirmation();
    };

    const handleCloseFeedback = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setFeedback({ ...feedback, open: false });
    };

    const isGymOpen = (day, time) => {
        const dayHours = openingHours[day];
        if (!dayHours) return false;
        return dayHours.some(slot => time >= slot.start && time < slot.end);
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    
    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                Εβδομαδιαίο Πρόγραμμα
            </Typography>
            
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="weekly schedule">
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
                        {timeSlots.map(time => (
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
                                                <Paper variant="outlined" sx={{ p: 1.5, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: cardColor, color: 'white' }}>
                                                    <Box>
                                                        <Typography variant="subtitle1" fontWeight="bold">{item.program.name}</Typography>
                                                        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{item.instructor.firstName} {item.instructor.lastName}</Typography>
                                                        <Typography variant="caption" display="block" sx={{ color: 'rgba(255, 255, 255, 0.8)', mt: 0.5 }}>
                                                            {item.attendanceCount} / {item.program.maxParticipants}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ mt: 1.5 }}>
                                                        {(() => {
                                                            if (!memberDetails?.isActive) {
                                                                return <Button size="small" variant="contained" color="error" disabled>Ανενεργός</Button>;
                                                            }
                                                            if (memberDetails?.membershipStatus === 'PAUSED') {
                                                                return <Button size="small" variant="contained" color="warning" disabled>Σε Παύση</Button>;
                                                            }
                                                            if (myBookings.has(item.id)) {
                                                                return <Button size="small" variant="contained" color="error" onClick={() => handleOpenConfirmation('Επιβεβαíωση Απεγγραφής', `Είστε σίγουροι ότι θέλετε να απεγγραφείτε από το ${item.program.name};`, () => handleCancelClass(item))}>Απεγγραφή</Button>;
                                                            }
                                                            if (item.attendanceCount >= item.program.maxParticipants) {
                                                                return <Button size="small" variant="contained" color="inherit" disabled>Γεμάτο</Button>;
                                                            }
                                                            return <Button size="small" variant="contained" sx={{ backgroundColor: 'white', color: 'black', '&:hover': { backgroundColor: '#e0e0e0' }}} onClick={() => handleOpenConfirmation('Επιβεβαíωση Εγγραφής', `Είστε σίγουροι ότι θέλετε να εγγραφείτε στο ${item.program.name};`, () => handleBookClass(item))}>Εγγραφή</Button>;
                                                        })()}
                                                    </Box>
                                                </Paper>
                                            ) : (
                                                !isGymOpen(day, time) && (
                                                    <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                                                        Κλειστά
                                                    </Typography>
                                                )
                                            )}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={confirmation.open} onClose={handleCloseConfirmation}>
                <DialogTitle>{confirmation.title}</DialogTitle>
                <DialogContent>
                    <DialogContentText>{confirmation.content}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseConfirmation} color="primary">Άκυρο</Button>
                    <Button onClick={handleConfirmAction} color="primary" autoFocus>Επιβεβαíωση</Button>
                </DialogActions>
            </Dialog>
      
            <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleCloseFeedback} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
                <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
                    {feedback.message}
                </Alert>
            </Snackbar>
        </Box>
    );
}