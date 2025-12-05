import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, CircularProgress, Alert, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Modal, CardActionArea, List, ListItem, ListItemText, Button, Divider } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { getMyAttendance, getMemberDetails } from '../services/gymService';
import HistoryIcon from '@mui/icons-material/History';

const dayTranslations = { MONDAY: "Δευτέρα", TUESDAY: "Τρίτη", WEDNESDAY: "Τετάρτη", THURSDAY: "Πέμπτη", FRIDAY: "Παρασκευή", SATURDAY: "Σάββατο", SUNDAY: "Κυριακή" };
const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const programColors = {
    CrossFit: '#D32F2F', Yoga: '#1976D2', Pilates: '#388E3C', "Body Pump": '#FBC02D',
    TRX: '#7B1FA2', Zumba: '#E64A19', Spinning: '#00796B', Default: '#546E7A'
};

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 500 }, bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, borderRadius: 2
};

export default function MyProgramAndAttendance() {
    const { user } = useAuth();
    const [timeSlots, setTimeSlots] = useState([]);
    const [scheduleTable, setScheduleTable] = useState({});
    const [attendanceHistory, setAttendanceHistory] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [memberDetails, setMemberDetails] = useState(null);

    const fetchData = useCallback(async () => {
        if (!user?.id) { setLoading(false); return; }
        
        try {
            const [attendanceData, memberData] = await Promise.all([
                getMyAttendance(user.id),
                getMemberDetails(user.id)
            ]);
            
            setAttendanceHistory(attendanceData);
            setMemberDetails(memberData);

            const memberSchedules = attendanceData.map(att => att.schedule).filter(Boolean);
            const uniqueTimes = [...new Set(memberSchedules.map(item => item.startTime))].sort();
            setTimeSlots(uniqueTimes);

            const tableData = memberSchedules.reduce((acc, item) => {
                const day = item.dayOfWeek;
                const time = item.startTime;
                if (!acc[day]) acc[day] = {};
                acc[day][time] = item;
                return acc;
            }, {});
            setScheduleTable(tableData);

        } catch (err) {
            setError("Αδυναμία φόρτωσης των δεδομένων σας.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenScheduleModal = (scheduleItem) => {
        setSelectedSchedule(scheduleItem);
        setIsScheduleModalOpen(true);
    };
    const handleCloseScheduleModal = () => setIsScheduleModalOpen(false);
    
    const handleOpenHistoryModal = () => setIsHistoryModalOpen(true);
    const handleCloseHistoryModal = () => setIsHistoryModalOpen(false);

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const filteredAttendance = selectedSchedule 
        ? attendanceHistory.filter(att => att.schedule?.id === selectedSchedule.id) 
        : [];

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
                Το Πρόγραμμα & οι Παρουσίες μου
            </Typography>

            {!memberDetails?.isActive && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Ο λογαριασμός σας είναι ανενεργός. Οι κρατήσεις σας δεν ισχύουν. Παρακαλούμε επικοινωνήστε με τη διαχείριση.
                </Alert>
            )}
            
            <TableContainer component={Paper} sx={{ mb: 4 }}>
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
                                    
                                    let statusContent;
                                    if (item) {
                                        if (!memberDetails?.isActive) {
                                            statusContent = (
                                                <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: 'error.light', color: 'text.primary', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{item.program.name}</Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>Ανενεργός</Typography>
                                                </Paper>
                                            );
                                        } else if (memberDetails?.membershipStatus === 'PAUSED') {
                                            statusContent = (
                                                <Paper variant="outlined" sx={{ p: 1.5, backgroundColor: 'warning.light', color: 'text.primary', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{item.program.name}</Typography>
                                                    <Typography variant="body2" sx={{ mt: 1 }}>Σε Παύση</Typography>
                                                </Paper>
                                            );
                                        } else {
                                             statusContent = (
                                                <Paper component={CardActionArea} onClick={() => handleOpenScheduleModal(item)} variant="outlined" sx={{ p: 1.5, backgroundColor: cardColor, color: 'white', height: '100%' }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">{item.program.name}</Typography>
                                                    <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.8)' }}>{item.instructor.firstName} {item.instructor.lastName}</Typography>
                                                </Paper>
                                            );
                                        }
                                    } else {
                                        statusContent = null;
                                    }

                                    return (
                                        <TableCell key={day} align="center" sx={{ verticalAlign: 'middle', p: 1, borderRight: index < dayOrder.length - 1 ? '1px solid rgba(224, 224, 224, 1)' : 'none' }}>
                                            {statusContent}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography sx={{ p: 4, color: 'text.secondary' }}>Δεν έχετε καμία εγγραφή σε προσεχή μαθήματα.</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button 
                    variant="contained" 
                    startIcon={<HistoryIcon />}
                    onClick={handleOpenHistoryModal}
                >
                    Συνολική Εικόνα Παρακολούθησης
                </Button>
            </Box>

            <Modal open={isScheduleModalOpen} onClose={handleCloseScheduleModal}>
                <Box sx={modalStyle}>
                    {selectedSchedule && (
                        <>
                            <Typography variant="h6" component="h2" gutterBottom>
                                Ιστορικό Παρουσιών για: {selectedSchedule.program.name}
                            </Typography>
                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
                                {dayTranslations[selectedSchedule.dayOfWeek]} {selectedSchedule.startTime} - {selectedSchedule.endTime}
                            </Typography>
                            <List dense sx={{ maxHeight: 300, overflow: 'auto' }}>
                                {filteredAttendance.length > 0 ? filteredAttendance.map(att => (
                                    <ListItem key={att.id}>
                                        <ListItemText 
                                            primary={new Date(att.attendedOn).toLocaleDateString('el-GR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            secondary={`Κατάσταση: ${att.status}`}
                                        />
                                    </ListItem>
                                )) : (
                                    <Typography>Δεν βρέθηκαν παρουσίες για αυτό το μάθημα.</Typography>
                                )}
                            </List>
                        </>
                    )}
                </Box>
            </Modal>
            
            <Modal open={isHistoryModalOpen} onClose={handleCloseHistoryModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6" component="h2" gutterBottom>
                        Συνολικό Ιστορικό Παρουσιών
                    </Typography>
                    <List dense sx={{ maxHeight: 400, overflow: 'auto' }}>
                        {attendanceHistory.length > 0 ? attendanceHistory.map(att => (
                            <React.Fragment key={att.id}>
                                <ListItem>
                                    <ListItemText 
                                        primary={`${att.programName} - ${new Date(att.attendedOn).toLocaleDateString('el-GR')}`}
                                        secondary={`Κατάσταση: ${att.status}`}
                                    />
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        )) : (
                            <Typography>Δεν βρέθηκε ιστορικό παρουσιών.</Typography>
                        )}
                    </List>
                </Box>
            </Modal>
        </Box>
    );
}