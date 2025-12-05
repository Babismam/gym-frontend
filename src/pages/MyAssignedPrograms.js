import React, { useState, useEffect, useCallback } from 'react';
import { 
    Box, Typography, CircularProgress, Alert, Accordion, AccordionSummary, AccordionDetails, 
    List, ListItem, ListItemText, Button, Modal, Divider, IconButton, Tooltip, 
    FormControl, InputLabel, Select, MenuItem, TextField, Snackbar,
    Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { useAuth } from '../context/AuthContext';
import { getTrainerSchedule, getAttendeesForSchedule, getAllPrograms, createSchedule, updateSchedule, deleteSchedule, getAllMembers, bookClass, removeAttendeeFromSchedule } from '../services/gymService';

const dayTranslations = { MONDAY: "Δευτέρα", TUESDAY: "Τρίτη", WEDNESDAY: "Τετάρτη", THURSDAY: "Πέμπτη", FRIDAY: "Παρασκευή", SATURDAY: "Σάββατο", SUNDAY: "Κυριακή" };
const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const programColors = { CrossFit: '#D32F2F', Yoga: '#1976D2', Pilates: '#388E3C', "Body Pump": '#FBC02D', TRX: '#7B1FA2', Zumba: '#E64A19', Spinning: '#00796B', Default: '#546E7A' };

const modalStyle = { position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4, borderRadius: 2 };
const emptySchedule = { programId: '', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00' };

export default function MyAssignedPrograms() {
    const { user } = useAuth();
    const [groupedSchedule, setGroupedSchedule] = useState({});
    const [allPrograms, setAllPrograms] = useState([]);
    const [allMembers, setAllMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expanded, setExpanded] = useState(false);
    const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });
    const [errorDialog, setErrorDialog] = useState({ open: false, message: '' });

    const [isAttendeesModalOpen, setIsAttendeesModalOpen] = useState(false);
    const [attendees, setAttendees] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [attendeesLoading, setAttendeesLoading] = useState(false);
    
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [currentSchedule, setCurrentSchedule] = useState(emptySchedule);
    const [isEditMode, setIsEditMode] = useState(false);
    const [memberToAdd, setMemberToAdd] = useState('');

    const fetchData = useCallback(async () => {
        if (!user?.id) { setLoading(false); return; }
        try {
            const [scheduleData, programsData, membersData] = await Promise.all([ getTrainerSchedule(user.id), getAllPrograms(), getAllMembers() ]);
            const grouped = scheduleData.reduce((acc, item) => {
                const programName = item.program.name;
                if (!acc[programName]) acc[programName] = [];
                acc[programName].push(item);
                return acc;
            }, {});
            setGroupedSchedule(grouped);
            setAllPrograms(programsData);
            setAllMembers(membersData);
        } catch (err) {
            setError("Αδυναμία φόρτωσης των προγραμμάτων σας.");
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleAccordionChange = (panel) => (event, isExpanded) => { setExpanded(isExpanded ? panel : false); };
    const handleOpenScheduleModal = (item) => {
        if (item) {
            setIsEditMode(true);
            setCurrentSchedule({ programId: item.program.id, dayOfWeek: item.dayOfWeek, startTime: item.startTime, endTime: item.endTime, id: item.id });
        } else {
            setIsEditMode(false);
            setCurrentSchedule(emptySchedule);
        }
        setIsScheduleModalOpen(true);
    };
    const handleCloseScheduleModal = () => setIsScheduleModalOpen(false);
    const handleScheduleChange = (e) => { setCurrentSchedule(prev => ({ ...prev, [e.target.name]: e.target.value })); };

    const handleSaveSchedule = async () => {
        try {
            if (isEditMode) {
                await updateSchedule(currentSchedule.id, currentSchedule);
                setFeedback({ open: true, message: 'Το μάθημα ενημερώθηκε με επιτυχία!', severity: 'success' });
            } else {
                await createSchedule(currentSchedule);
                setFeedback({ open: true, message: 'Το μάθημα δημιουργήθηκε με επιτυχία!', severity: 'success' });
            }
            fetchData();
            handleCloseScheduleModal();
        } catch(err) { setFeedback({ open: true, message: 'Η αποθήκευση απέτυχε.', severity: 'error' }); }
    };

    const handleDeleteSchedule = async (id) => {
        if (window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτό το μάθημα;")) {
            try {
                await deleteSchedule(id);
                setFeedback({ open: true, message: 'Επιτυχής Διαγραφή!', severity: 'success' });
                fetchData();
            } catch(err) { setFeedback({ open: true, message: 'Η διαγραφή απέτυχε.', severity: 'error' }); }
        }
    };

    const refreshAttendees = async (scheduleId) => {
        setAttendeesLoading(true);
        try {
            const attendeesData = await getAttendeesForSchedule(scheduleId);
            setAttendees(attendeesData);
        } catch (err) {
            console.error("Failed to refresh attendees", err);
        } finally {
            setAttendeesLoading(false);
        }
    };

    const handleViewAttendees = (scheduleItem) => {
        setSelectedSchedule(scheduleItem);
        setIsAttendeesModalOpen(true);
        refreshAttendees(scheduleItem.id);
    };
    const handleCloseAttendeesModal = () => setIsAttendeesModalOpen(false);
    
    const handleAddAttendee = async () => {
        if (!memberToAdd || !selectedSchedule) return;
        try {
            await bookClass(memberToAdd, selectedSchedule.id);
            setFeedback({ open: true, message: 'Επιτυχής Εισαγωγή!', severity: 'success' });
            refreshAttendees(selectedSchedule.id);
            fetchData();
            setMemberToAdd('');
        } catch (err) {
            let errorMessage = 'Η εισαγωγή απέτυχε.';
            if (err.response?.data) {
                errorMessage = err.response.data.message || err.response.data.error || (typeof err.response.data === 'string' ? err.response.data : errorMessage);
            } else if (err.message) {
                errorMessage = err.message;
            }

            if (err.response && (err.response.status === 403 || err.response.status === 409)) {
                setErrorDialog({ open: true, message: errorMessage });
            } else {
                setFeedback({ open: true, message: errorMessage, severity: 'error' });
            }
            console.error("Failed to add attendee:", err.response || err);
        }
    };

    const handleRemoveAttendee = async (memberId) => {
        if (!selectedSchedule) return;
        if (window.confirm("Είστε σίγουρος/η ότι θέλετε να αφαιρέσετε αυτό το μέλος;")) {
            try {
                await removeAttendeeFromSchedule(selectedSchedule.id, memberId);
                setFeedback({ open: true, message: 'Επιτυχής Διαγραφή!', severity: 'success' });
                refreshAttendees(selectedSchedule.id);
                fetchData();
            } catch(err) { setFeedback({ open: true, message: 'Η διαγραφή απέτυχε.', severity: 'error' }); }
        }
    };

    const handleCloseFeedback = (event, reason) => {
        if (reason === 'clickaway') return;
        setFeedback({ ...feedback, open: false });
    };

    const handleCloseErrorDialog = () => {
        setErrorDialog({ open: false, message: '' });
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Alert severity="error">{error}</Alert>;

    const availableMembers = allMembers.filter(member => !attendees.some(att => att.id === member.id));

    return (
        <Box sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" gutterBottom>Τα Προγράμματά μου</Typography>
                <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenScheduleModal(null)}>Προσθήκη Μαθήματος</Button>
            </Box>
            {Object.keys(groupedSchedule).length > 0 ? (
                Object.keys(groupedSchedule).map(programName => (
                    <Accordion key={programName} expanded={expanded === programName} onChange={handleAccordionChange(programName)} sx={{ mb: 1.5, '&.Mui-expanded': { margin: '16px 0' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />} sx={{ backgroundColor: programColors[programName] || programColors.Default, color: 'white', '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
                            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>{programName}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                            <List disablePadding>
                                {groupedSchedule[programName].sort((a,b) => dayOrder.indexOf(a.dayOfWeek) - dayOrder.indexOf(b.dayOfWeek) || a.startTime.localeCompare(b.startTime)).map((item, index) => (
                                    <React.Fragment key={item.id}>
                                        <ListItem secondaryAction={
                                            <Box>
                                                <Button variant="outlined" size="small" onClick={() => handleViewAttendees(item)} sx={{ mr: 1 }}>Συμμετέχοντες ({item.attendanceCount})</Button>
                                                <Tooltip title="Επεξεργασία"><IconButton edge="end" onClick={() => handleOpenScheduleModal(item)}><EditIcon /></IconButton></Tooltip>
                                                <Tooltip title="Διαγραφή"><IconButton edge="end" onClick={() => handleDeleteSchedule(item.id)}><DeleteIcon color="error" /></IconButton></Tooltip>
                                            </Box>
                                        }>
                                            <ListItemText primary={`${dayTranslations[item.dayOfWeek]}: ${item.startTime} - ${item.endTime}`} secondary={`Διαθεσιμότητα: ${item.attendanceCount} / ${item.program.maxParticipants}`} />
                                        </ListItem>
                                        {index < groupedSchedule[programName].length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        </AccordionDetails>
                    </Accordion>
                ))
            ) : ( <Typography>Δεν έχετε ανατεθειμένα μαθήματα.</Typography> )}
            
            <Modal open={isAttendeesModalOpen} onClose={handleCloseAttendeesModal}>
                <Box sx={modalStyle}>
                    {selectedSchedule && (<> <Typography variant="h6">Συμμετέχοντες για: {selectedSchedule.program.name}</Typography> <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>{dayTranslations[selectedSchedule.dayOfWeek]} {selectedSchedule.startTime}</Typography> </>)}
                    {attendeesLoading ? <CircularProgress /> : (
                        <Box>
                            <List dense sx={{ maxHeight: 200, overflow: 'auto' }}>
                                {attendees.length > 0 ? attendees.map(att => (
                                    <ListItem key={att.id} secondaryAction={<Tooltip title="Αφαίρεση"><IconButton edge="end" onClick={() => handleRemoveAttendee(att.id)}><DeleteIcon color="error" /></IconButton></Tooltip>}>
                                        <ListItemText primary={`${att.firstName} ${att.lastName}`} />
                                    </ListItem>
                                )) : <Typography>Δεν υπάρχουν εγγεγραμμένοι συμμετέχοντες.</Typography>}
                            </List>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1">Προσθήκη Μέλους</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                <FormControl fullWidth size="small" sx={{ mr: 1 }}>
                                    <InputLabel>Επιλογή Μέλους</InputLabel>
                                    <Select value={memberToAdd} label="Επιλογή Μέλους" onChange={(e) => setMemberToAdd(e.target.value)}>
                                        {availableMembers.map(member => (
                                            <MenuItem key={member.id} value={member.id}>{member.firstName} {member.lastName}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button variant="contained" onClick={handleAddAttendee} disabled={!memberToAdd}>Προσθήκη</Button>
                            </Box>
                        </Box>
                    )}
                </Box>
            </Modal>
            
            <Modal open={isScheduleModalOpen} onClose={handleCloseScheduleModal}>
                <Box sx={modalStyle}>
                    <Typography variant="h6">{isEditMode ? 'Επεξεργασία Μαθήματος' : 'Νέο Μάθημα'}</Typography>
                    {!isEditMode && (
                        <FormControl fullWidth margin="normal">
                            <InputLabel>Πρόγραμμα</InputLabel>
                            <Select name="programId" value={currentSchedule.programId} label="Πρόγραμμα" onChange={handleScheduleChange}>
                                {allPrograms.map(p => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    )}
                    <FormControl fullWidth margin="normal">
                        <InputLabel>Ημέρα</InputLabel>
                        <Select name="dayOfWeek" value={currentSchedule.dayOfWeek} label="Ημέρα" onChange={handleScheduleChange}>
                            {dayOrder.map(day => <MenuItem key={day} value={day}>{dayTranslations[day]}</MenuItem>)}
                        </Select>
                    </FormControl>
                    <TextField name="startTime" label="Ώρα Έναρξης" type="time" value={currentSchedule.startTime} onChange={handleScheduleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
                    <TextField name="endTime" label="Ώρα Λήξης" type="time" value={currentSchedule.endTime} onChange={handleScheduleChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
                    <Button onClick={handleSaveSchedule} variant="contained" sx={{ mt: 2 }}>Αποθήκευση</Button>
                </Box>
            </Modal>
            
            <Snackbar open={feedback.open} autoHideDuration={4000} onClose={handleCloseFeedback}>
                <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
                    {feedback.message}
                </Alert>
            </Snackbar>

            <Dialog open={errorDialog.open} onClose={handleCloseErrorDialog}>
                <DialogTitle>Αποτυχία Εγγραφής</DialogTitle>
                <DialogContent>
                    <DialogContentText>{errorDialog.message}</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseErrorDialog}>Εντάξει</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}