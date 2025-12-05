import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Modal, TextField,
  IconButton, Snackbar, Alert
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { getAllPrograms, createProgram, updateProgram, deleteProgram } from '../services/gymService';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const emptyProgram = {
  name: '',
  description: '',
  durationMinutes: 60,
  maxParticipants: 10
};

export default function ManagePrograms() {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [feedback, setFeedback] = useState({ open: false, message: '', severity: 'success' });

  const fetchPrograms = async () => {
    try {
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (error) {
      console.error("Failed to fetch programs:", error);
      setFeedback({ open: true, message: 'Αποτυχία φόρτωσης των προγραμμάτων.', severity: 'error' });
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleOpenModal = (program) => {
    if (program) {
      const sanitizedProgram = {
        ...program,
        name: program.name || '',
        description: program.description || '',
        durationMinutes: program.durationMinutes || 0,
        maxParticipants: program.maxParticipants || 0,
      };
      setSelectedProgram(sanitizedProgram);
      setIsCreateMode(false);
    } else {
      setSelectedProgram(emptyProgram);
      setIsCreateMode(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProgram(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedProgram(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    if (!selectedProgram) return;
    try {
      if (isCreateMode) {
        await createProgram(selectedProgram);
        setFeedback({ open: true, message: 'Το πρόγραμμα δημιουργήθηκε με επιτυχία!', severity: 'success' });
      } else {
        await updateProgram(selectedProgram.id, selectedProgram);
        setFeedback({ open: true, message: 'Το πρόγραμμα ενημερώθηκε με επιτυχία!', severity: 'success' });
      }
      handleCloseModal();
      fetchPrograms();
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Προέκυψε σφάλμα.';
      console.error("Operation failed:", error);
      setFeedback({ open: true, message: `Η ενέργεια απέτυχε: ${errorMsg}`, severity: 'error' });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Είστε σίγουροι ότι θέλετε να διαγράψετε αυτό το πρόγραμμα;")) {
      try {
        await deleteProgram(id);
        setFeedback({ open: true, message: 'Το πρόγραμμα διαγράφηκε με επιτυχία!', severity: 'success' });
        fetchPrograms();
      } catch (error) {
        console.error("Failed to delete program:", error);
        setFeedback({ open: true, message: 'Αποτυχία διαγραφής του προγράμματος.', severity: 'error' });
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
        <Typography variant="h4" gutterBottom>Διαχείριση Προγραμμάτων</Typography>
        <Button
          variant="contained"
          startIcon={<AddCircleIcon />}
          onClick={() => handleOpenModal(null)}
        >
          Προσθήκη Νέου Προγράμματος
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Όνομα Προγράμματος</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Περιγραφή</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Διάρκεια (λεπτά)</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Μέγ. Συμμετέχοντες</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Ενέργειες</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programs.map((program, index) => (
              <TableRow key={program.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{program.name}</TableCell>
                <TableCell>{program.description}</TableCell>
                <TableCell>{program.durationMinutes}</TableCell>
                <TableCell>{program.maxParticipants}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpenModal(program)} color="primary">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(program.id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box sx={modalStyle}>
          <Typography variant="h6">{isCreateMode ? 'Προσθήκη Νέου Προγράμματος' : 'Επεξεργασία Προγράμματος'}</Typography>
          {selectedProgram && (
            <Box component="form" noValidate autoComplete="off">
              <TextField name="name" label="Όνομα Προγράμματος" value={selectedProgram.name} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="description" label="Περιγραφή" value={selectedProgram.description} onChange={handleInputChange} fullWidth margin="normal" multiline rows={4} />
              <TextField name="durationMinutes" label="Διάρκεια (λεπτά)" type="number" value={selectedProgram.durationMinutes} onChange={handleInputChange} fullWidth margin="normal" />
              <TextField name="maxParticipants" label="Μέγιστος Αριθμός Συμμετεχόντων" type="number" value={selectedProgram.maxParticipants} onChange={handleInputChange} fullWidth margin="normal" />
              <Button onClick={handleSaveChanges} variant="contained" sx={{ mt: 2 }}>
                {isCreateMode ? 'Δημιουργία' : 'Αποθήκευση Αλλαγών'}
              </Button>
            </Box>
          )}
        </Box>
      </Modal>

      <Snackbar open={feedback.open} autoHideDuration={6000} onClose={handleCloseFeedback}>
        <Alert onClose={handleCloseFeedback} severity={feedback.severity} sx={{ width: '100%' }}>
          {feedback.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}