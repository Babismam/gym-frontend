import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Modal, TextField,
  IconButton, Snackbar, Alert, Switch, FormControlLabel, Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import { getAllTrainers, createTrainer, updateTrainer, deleteTrainer } from '../services/gymService';

const modalStyle = {
  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
  width: { xs: '90%', sm: 600 }, bgcolor: 'background.paper', border: '2px solid #000',
  boxShadow: 24, p: 4, borderRadius: 2
};

const emptyTrainer = {
  firstName: '', lastName: '', email: '', phone: '', username: '',
  password: '', dateOfBirth: '', isActive: true, bio: '', specialties: ''
};

export default function ManageTrainers() {
  const [trainers, setTrainers] = useState([]);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const fetchTrainers = async () => {
    try {
      const data = await getAllTrainers(true);
      setTrainers(data);
    } catch (error) {
      setFeedback({ open: true, message: 'Αποτυχία φόρτωσης των γυμναστών.', severity: 'error' });
    }
  };

  useEffect(() => { fetchTrainers(); }, []);

  const handleOpenModal = (trainer) => {
    if (trainer) {
      const sanitizedTrainer = {
        ...trainer,
        firstName: trainer.firstName || '',
        lastName: trainer.lastName || '',
        email: trainer.email || '',
        phone: trainer.phone || '',
        dateOfBirth: trainer.dateOfBirth || '',
        isActive: trainer.isActive ?? true,
        bio: trainer.bio || '',
        specialties: trainer.specialties || ''
      };
      setSelectedTrainer(sanitizedTrainer);
      setIsCreateMode(false);
    } else {
      setSelectedTrainer(emptyTrainer);
      setIsCreateMode(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedTrainer(null); };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSelectedTrainer(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedTrainer) return;
    try {
      if (isCreateMode) {
        await createTrainer(selectedTrainer);
        setFeedback({ open: true, message: 'Ο γυμναστής δημιουργήθηκε με επιτυχία!', severity: 'success' });
      } else {
        await updateTrainer(selectedTrainer.id, selectedTrainer);
        setFeedback({ open: true, message: 'Ο γυμναστής ενημερώθηκε με επιτυχία!', severity: 'success' });
      }
      handleCloseModal();
      fetchTrainers();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Προέκυψε σφάλμα.';
      setFeedback({ open: true, message: `Η ενέργεια απέτυχε: ${errorMsg}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Είστε σίγουρος/η ότι θέλετε να διαγράψετε αυτόν τον γυμναστή;")) {
      try {
        await deleteTrainer(id);
        setFeedback({ open: true, message: 'Ο γυμναστής διαγράφηκε με επιτυχία!', severity: 'success' });
        fetchTrainers();
      } catch (error) {
        setFeedback({ open: true, message: 'Αποτυχία διαγραφής του γυμναστή.', severity: 'error' });
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
        <Typography variant="h4" gutterBottom>Διαχείριση Γυμναστών</Typography>
        <Button variant="contained" startIcon={<AddCircleIcon />} onClick={() => handleOpenModal(null)}>
          Προσθήκη Νέου Γυμναστή
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
              <TableCell>Ημ. Δημιουργίας</TableCell>
              <TableCell>Κατάσταση</TableCell>
              <TableCell align="right">Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {trainers.map((trainer, index) => (
              <TableRow key={trainer.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{trainer.firstName} {trainer.lastName}</TableCell>
                <TableCell>{trainer.email}</TableCell>
                <TableCell>{trainer.phone || '-'}</TableCell>
                <TableCell>{new Date(trainer.createdAt).toLocaleDateString('el-GR')}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography 
                      variant="body2"
                      sx={{ color: trainer.isActive ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                    >
                      {trainer.isActive ? 'Ενεργός' : 'Ανενεργός'}
                    </Typography>
                    {trainer.membershipStatus === 'PAUSED' && (
                      <Tooltip title="Σε Παύση από τον χρήστη">
                        <PauseCircleIcon color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Επεξεργασία"><IconButton onClick={() => handleOpenModal(trainer)} color="primary"><EditIcon /></IconButton></Tooltip>
                  <Tooltip title="Διαγραφή"><IconButton color="error" onClick={() => handleDelete(trainer.id)}><DeleteIcon /></IconButton></Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">{isCreateMode ? 'Προσθήκη Νέου Γυμναστή' : 'Επεξεργασία Γυμναστή'}</Typography>
          {selectedTrainer && (
            <Box component="form" noValidate autoComplete="off" sx={{ mt: 2, maxHeight: '80vh', overflowY: 'auto' }}>
              <TextField name="firstName" label="Όνομα" value={selectedTrainer.firstName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="lastName" label="Επώνυμο" value={selectedTrainer.lastName} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="email" label="Email" type="email" value={selectedTrainer.email} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="phone" label="Τηλέφωνο" value={selectedTrainer.phone} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="dateOfBirth" label="Ημερομηνία Γέννησης" type="date" value={selectedTrainer.dateOfBirth} onChange={handleInputChange} fullWidth margin="normal" InputLabelProps={{ shrink: true }} />
              <TextField name="specialties" label="Ειδικότητες (π.χ. Yoga, CrossFit)" value={selectedTrainer.specialties} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="bio" label="Βιογραφικό" value={selectedTrainer.bio} onChange={handleInputChange} fullWidth margin="normal" multiline rows={3} />
              
              <Typography sx={{ mt: 2, color: 'text.secondary' }}>Στοιχεία Λογαριασμού</Typography>
              <TextField name="username" label="Username" value={selectedTrainer.username} onChange={handleInputChange} fullWidth margin="normal" disabled={!isCreateMode} />
              {isCreateMode && <TextField name="password" label="Password" type="password" value={selectedTrainer.password} onChange={handleInputChange} fullWidth margin="normal" />}

              <FormControlLabel
                control={<Switch name="isActive" checked={selectedTrainer.isActive} onChange={handleInputChange} />}
                label="Κατάσταση Λογαριασμού (Ενεργός/Ανενεργός)"
              />
              
              <Button onClick={handleSaveChanges} variant="contained" sx={{ mt: 3 }} fullWidth>
                {isCreateMode ? 'Δημιουργία' : 'Αποθήκευση Αλλαγών'}
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