import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Paper, CircularProgress, Alert, Grid, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Snackbar, CardActionArea, TextField } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMemberDetails, changeMembership, pauseMembership, deleteAccount, resumeMembership } from '../services/gymService';

import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('el-GR');
};
const membershipTypeTranslations = { FULL: "Full", BASIC: "Basic", PERSONAL: "Personal Trainer" };
const membershipStatusTranslations = { ACTIVE: "Ενεργή", PAUSED: "Σε Παύση", EXPIRED: "Έχει Λήξει", CANCELLED: "Ακυρωμένη" };

function DashboardCard({ title, value, subtitle, icon, onClick, linkTo }) {
    const content = (
        <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, textAlign: 'center' }}>
            <Box sx={{ mb: 1.5 }}>{icon}</Box>
            {value && <Typography variant="h4" component="p" fontWeight="bold">{value}</Typography>}
            <Typography variant="h6" color="text.primary">{title}</Typography>
            {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
        </Box>
    );

    return (
        <Grid item xs={12} md={4}>
            <Paper 
                elevation={4} 
                sx={{ 
                    height: '100%',
                    '&:hover': { transform: 'scale(1.03)', boxShadow: 8 },
                    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
            >
                {linkTo ? <CardActionArea component={RouterLink} to={linkTo} sx={{height: '100%'}}>{content}</CardActionArea> 
                        : <CardActionArea onClick={onClick} sx={{height: '100%'}}>{content}</CardActionArea>}
            </Paper>
        </Grid>
    );
}

export default function MemberDashboard() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isManagementModalOpen, setIsManagementModalOpen] = useState(false);
  const [managementView, setManagementView] = useState('main');

  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [pauseDays, setPauseDays] = useState(7);
  const [feedback, setFeedback] = useState({ open: false, message: '' });

  useEffect(() => {
    const fetchMemberDetails = async () => {
      if (!user?.id) { setLoading(false); return; }
      try {
        setLoading(true);
        const data = await getMemberDetails(user.id);
        setMemberDetails(data);
      } catch (err) {
        setError('Αδυναμία φόρτωσης των στοιχείων σας.');
      } finally {
        setLoading(false);
      }
    };
    fetchMemberDetails();
  }, [user]);

  const openManagementModal = () => {
    if (!memberDetails?.isActive) return;
    setManagementView('main');
    setSelectedPlan(memberDetails?.membershipType || '');
    setSelectedDuration('');
    setCustomStartDate('');
    setCustomEndDate('');
    setIsManagementModalOpen(true);
  };
  
  const closeManagementModal = () => setIsManagementModalOpen(false);
  
  const handleChangeMembership = async () => {
    try {
      const membershipData = {
        membershipType: selectedPlan,
        membershipDuration: selectedDuration,
        customStartDate: customStartDate,
        customEndDate: customEndDate
      };
      await changeMembership(user.id, membershipData);
      setFeedback({ open: true, message: 'Η συνδρομή σας άλλαξε με επιτυχία!' });
      const data = await getMemberDetails(user.id);
      setMemberDetails(data);
    } catch (err) {
      setError(err.message || 'Η αλλαγή απέτυχε.');
    } finally {
      closeManagementModal();
    }
  };

  const handlePauseMembership = async () => {
    try {
      await pauseMembership(user.id, pauseDays);
      setFeedback({ open: true, message: `Η συνδρομή τέθηκε σε παύση για ${pauseDays} ημέρες.` });
      const data = await getMemberDetails(user.id);
      setMemberDetails(data);
    } catch (err) {
      setError(err.message || 'Η παύση απέτυχε.');
    } finally {
      closeManagementModal();
    }
  };

  const handleResumeMembership = async () => {
    try {
      await resumeMembership(user.id);
      setFeedback({ open: true, message: 'Η συνδρομή σας ενεργοποιήθηκε ξανά!' });
      const data = await getMemberDetails(user.id);
      setMemberDetails(data);
    } catch (err) {
       setError(err.message || 'Η ενεργοποίηση απέτυχε.');
    } finally {
      closeManagementModal();
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount(user.id);
      alert('Ο λογαριασμός σας διαγράφηκε με επιτυχία.');
      handleLogout();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Η διαγραφή απέτυχε.');
    } finally {
      closeManagementModal();
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  const daysLeft = memberDetails?.daysUntilMembershipExpiry;
  const daysLeftValue = (daysLeft !== null && daysLeft >= 0) ? daysLeft : 'N/A';

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', p: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ mt: 2 }}>
            🏋️ Καλώς ήρθες, {memberDetails ? memberDetails.firstName : 'Μέλος'}!
        </Typography>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 4 }}>
            Αυτός είναι ο προσωπικός σου χώρος. Δες την πρόοδό σου και διαχειρίσου τη συνδρομή σου.
        </Typography>
        
        {error && <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: '900px' }}>{error}</Alert>}

        {!memberDetails?.isActive && (
            <Alert severity="warning" sx={{ width: '100%', maxWidth: '900px' }}>
                Ο λογαριασμός σας είναι ανενεργός. Παρακαλούμε επικοινωνήστε με τη διαχείριση του γυμναστηρίου.
            </Alert>
        )}

        <Grid container spacing={4} sx={{ maxWidth: '900px', width: '100%', justifyContent: 'center', mt: 0 }}>
            <DashboardCard 
                title="Το Πρόγραμμά μου"
                subtitle="Παρουσίες & Κρατήσεις"
                icon={<FitnessCenterIcon sx={{ fontSize: 60 }} color="primary" />}
                linkTo="/member/program"
            />
             <DashboardCard 
                title="Πρόγραμμα Γυμναστηρίου"
                subtitle="Δες όλα τα μαθήματα"
                icon={<CalendarMonthIcon sx={{ fontSize: 60 }} color="secondary" />}
                linkTo="/schedule"
            />
            <DashboardCard 
                title="Η Συνδρομή μου"
                value={daysLeftValue}
                subtitle="Κλικ για διαχείριση"
                icon={<EventAvailableIcon sx={{ fontSize: 60 }} color={daysLeft < 7 ? "error" : "success"} />}
                onClick={openManagementModal}
            />
        </Grid>
      
      <Dialog open={isManagementModalOpen} onClose={closeManagementModal} fullWidth maxWidth="sm">
        {managementView === 'main' && (
            <>
                <DialogTitle>Η Συνδρομή μου</DialogTitle>
                <DialogContent dividers>
                    {memberDetails ? (
                        <Box>
                            <Typography><b>Τύπος Συνδρομής:</b> {membershipTypeTranslations[memberDetails.membershipType] || memberDetails.membershipType}</Typography>
                            <Typography><b>Κατάσταση:</b> {membershipStatusTranslations[memberDetails.membershipStatus] || memberDetails.membershipStatus}</Typography>
                            <Typography><b>Ημερομηνία Έναρξης:</b> {formatDate(memberDetails.membershipStartDate)}</Typography>
                            <Typography><b>Ημερομηνία Λήξης:</b> {formatDate(memberDetails.membershipEndDate)}</Typography>
                            {memberDetails.membershipStatus === 'PAUSED' && (
                                <Typography><b>Η παύση λήγει:</b> {formatDate(memberDetails.pauseEndDate)}</Typography>
                            )}
                        </Box>
                    ) : <Typography>Δεν βρέθηκαν στοιχεία συνδρομής.</Typography>}
                </DialogContent>
                <DialogActions sx={{ p: 2, justifyContent: 'center', flexWrap: 'wrap', gap: 1.5 }}>
                    <Button variant="contained" onClick={() => setManagementView('change')}>Αλλαγή</Button>
                    {memberDetails?.membershipStatus === 'PAUSED' ? (
                         <Button variant="contained" color="success" onClick={handleResumeMembership}>Συνέχιση Συνδρομής</Button>
                    ) : (
                         <Button variant="contained" color="warning" onClick={() => setManagementView('pause')}>Παύση</Button>
                    )}
                    <Button variant="contained" color="error" onClick={() => setManagementView('delete')}>Διαγραφή</Button>
                </DialogActions>
            </>
        )}

        {managementView === 'change' && (
            <>
                <DialogTitle>Αλλαγή Πλάνου Συνδρομής</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{mb: 2}}>Η νέα συνδρομή θα ξεκινήσει άμεσα, αντικαθιστώντας την παλιά.</Typography>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Νέο Πλάνο</InputLabel>
                        <Select value={selectedPlan} label="Νέο Πλάνο" onChange={(e) => setSelectedPlan(e.target.value)}>
                            <MenuItem value="FULL">Full</MenuItem>
                            <MenuItem value="BASIC">Basic</MenuItem>
                            <MenuItem value="PERSONAL">Personal Trainer</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControl fullWidth sx={{ mt: 2 }} disabled={selectedPlan === 'PERSONAL'}>
                        <InputLabel>Διάρκεια</InputLabel>
                        <Select value={selectedDuration} label="Διάρκεια" onChange={(e) => setSelectedDuration(e.target.value)}>
                            <MenuItem value="3-MONTH">3μηνη</MenuItem>
                            <MenuItem value="6-MONTH">6μηνη</MenuItem>
                            <MenuItem value="12-MONTH">12μηνη</MenuItem>
                            <MenuItem value="CUSTOM">Προσαρμοσμένη</MenuItem>
                        </Select>
                    </FormControl>
                    {selectedDuration === 'CUSTOM' && (
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6}>
                                <TextField fullWidth name="customStartDate" label="Έναρξη" type="date" InputLabelProps={{ shrink: true }} value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField fullWidth name="customEndDate" label="Λήξη" type="date" InputLabelProps={{ shrink: true }} value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} />
                            </Grid>
                        </Grid>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManagementView('main')}>Πίσω</Button>
                    <Button onClick={handleChangeMembership} variant="contained">Επιβεβαíωση</Button>
                </DialogActions>
            </>
        )}

        {managementView === 'pause' && (
            <>
                <DialogTitle>Παύση Συνδρομής</DialogTitle>
                <DialogContent>
                    <Typography>Επιλέξτε τη διάρκεια της παύσης. Η συνδρομή σας θα επεκταθεί κατά τις αντίστοιχες ημέρες.</Typography>
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Διάρκεια Παύσης</InputLabel>
                        <Select value={pauseDays} label="Διάρκεια Παύσης" onChange={(e) => setPauseDays(e.target.value)}>
                            <MenuItem value={7}>7 Ημέρες</MenuItem>
                            <MenuItem value={14}>14 Ημέρες</MenuItem>
                            <MenuItem value={30}>30 Ημέρες</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManagementView('main')}>Πίσω</Button>
                    <Button onClick={handlePauseMembership} variant="contained">Επιβεβαíωση</Button>
                </DialogActions>
            </>
        )}

        {managementView === 'delete' && (
            <>
                <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
                <DialogContent>
                    <Typography>Είστε απόλυτα σίγουροι; Αυτή η ενέργεια είναι **μη αναστρέψιμη** και θα διαγράψει οριστικά όλα τα δεδομένα σας.</Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setManagementView('main')}>Πίσω</Button>
                    <Button onClick={handleDeleteAccount} variant="contained" color="error">Διαγραφή</Button>
                </DialogActions>
            </>
        )}
      </Dialog>
      
      <Snackbar open={feedback.open} autoHideDuration={6000} onClose={() => setFeedback({ open: false, message: '' })} message={feedback.message} />
    </Box>
  );
}