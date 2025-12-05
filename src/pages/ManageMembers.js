import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Modal, TextField,
  IconButton, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem,
  Switch, FormControlLabel, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle'; // Αλλαγή εδώ
import { getAllMembers, updateMember, deleteMember, createMember } from '../services/gymService';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 }, bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, borderRadius: 2
};

const emptyMember = {
  firstName: '', lastName: '', email: '', phone: '', username: '',
  password: '', membershipType: 'BASIC', dateOfBirth: '',
  membershipStartDate: '', membershipEndDate: '', isActive: true
};

const membershipOptions = ['BASIC', 'FULL', 'PERSONAL_TRAINING'];

export default function ManageMembers() {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const fetchMembers = async () => {
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (error) {
      setFeedback({ open: true, message: 'Failed to load members.', severity: 'error' });
    }
  };

  useEffect(() => { fetchMembers(); }, []);

  const handleOpenModal = (member) => {
    if (member) {
      const sanitizedMember = {
        ...member,
        firstName: member.firstName || '',
        lastName: member.lastName || '',
        email: member.email || '',
        phone: member.phone || '',
        membershipType: member.membershipType || 'BASIC',
        dateOfBirth: member.dateOfBirth || '',
        membershipStartDate: member.membershipStartDate || '',
        membershipEndDate: member.membershipEndDate || '',
        isActive: member.isActive ?? true,
      };
      setSelectedMember(sanitizedMember);
      setIsCreateMode(false);
    } else {
      setSelectedMember(emptyMember);
      setIsCreateMode(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedMember(null); };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedMember(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedMember) return;
    try {
      if (isCreateMode) {
        await createMember(selectedMember);
        setFeedback({ open: true, message: 'Member created successfully!', severity: 'success' });
      } else {
        await updateMember(selectedMember.id, selectedMember);
        setFeedback({ open: true, message: 'Member updated successfully!', severity: 'success' });
      }
      handleCloseModal();
      fetchMembers();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'An error occurred.';
      setFeedback({ open: true, message: `Operation failed: ${errorMsg}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτό το μέλος;")) {
      try {
        await deleteMember(id);
        setFeedback({ open: true, message: 'Member deleted successfully!', severity: 'success' });
        fetchMembers();
      } catch (error) {
        setFeedback({ open: true, message: 'Failed to delete member.', severity: 'error' });
      }
    }
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') return;
    setFeedback({ ...feedback, open: false });
  };

  return (
    <Box sx={{ padding: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" gutterBottom>Διαχείριση Μελών</Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenModal(null)}>
          Προσθήκη Νέου Μέλους
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Όνομα</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Τηλέφωνο</TableCell>
              <TableCell>Τύπος Συνδρομής</TableCell>
              <TableCell>Έναρξη Συνδρομής</TableCell>
              <TableCell>Λήξη Συνδρομής</TableCell>
              <TableCell>Κατάσταση</TableCell>
              <TableCell align="right">Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {members.map((member, index) => (
              <TableRow key={member.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{member.firstName} {member.lastName}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.phone || '-'}</TableCell>
                <TableCell>{member.membershipType || '-'}</TableCell>
                <TableCell>{member.membershipStartDate || '-'}</TableCell>
                <TableCell>{member.membershipEndDate || '-'}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2"
                      sx={{ color: member.isActive ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                    >
                      {member.isActive ? 'Ενεργό' : 'Ανενεργό'}
                    </Typography>
                    {member.membershipStatus === 'PAUSED' && (
                      <Tooltip title="Σε Παύση από τον χρήστη">
                        <PauseCircleIcon color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Επεξεργασία"><IconButton onClick={() => handleOpenModal(member)} color="primary"><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Διαγραφή"><IconButton color="error" onClick={() => handleDelete(member.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">{isCreateMode ? 'Προσθήκη Νέου Μέλους' : 'Επεξεργασία Μέλους'}</Typography>
          {selectedMember && (
            <Box component="form" noValidate autoComplete="off" sx={{ mt: 2, maxHeight: '80vh', overflowY: 'auto' }}>
              <TextField name="firstName" label="Όνομα" value={selectedMember.firstName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="lastName" label="Επώνυμο" value={selectedMember.lastName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="email" label="Email" type="email" value={selectedMember.email} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="phone" label="Τηλέφωνο" value={selectedMember.phone} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="dateOfBirth" label="Ημερομηνία Γέννησης" type="date" value={selectedMember.dateOfBirth} onChange={handleInputChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
              
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Στοιχεία Λογαριασμού</Typography>
              <TextField name="username" label="Username" value={selectedMember.username} onChange={handleInputChange} fullWidth margin="normal" disabled={!isCreateMode} />
              {isCreateMode && <TextField name="password" label="Password" type="password" value={selectedMember.password} onChange={handleInputChange} fullWidth margin="normal" />}

              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Στοιχεία Συνδρομής</Typography>
              <FormControl fullWidth margin="normal">
                <InputLabel>Τύπος Συνδρομής</InputLabel>
                <Select name="membershipType" value={selectedMember.membershipType} label="Τύπος Συνδρομής" onChange={handleInputChange}>
                  {membershipOptions.map(option => <MenuItem key={option} value={option}>{option.replace('_', ' ')}</MenuItem>)}
                </Select>
              </FormControl>
              <TextField name="membershipStartDate" label="Έναρξη Συνδρομής" type="date" value={selectedMember.membershipStartDate} onChange={handleInputChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
              <TextField name="membershipEndDate" label="Λήξη Συνδρομής" type="date" value={selectedMember.membershipEndDate} onChange={handleInputChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
              
              <FormControlLabel
                control={<Switch name="isActive" checked={selectedMember.isActive} onChange={handleInputChange} />}
                label="Κατάσταση Λογαριασμού (Ενεργός/Ανενεργός)"
              />
              
              <Button onClick={handleSaveChanges} variant="contained" sx={{ mt: 3 }} fullWidth>
                {isCreateMode ? 'Δημιουργία Μέλους' : 'Αποθήκευση Αλλαγών'}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      <Snackbar open={feedback.open} autoHideDuration={4000} onClose={handleCloseFeedback}>
        <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}