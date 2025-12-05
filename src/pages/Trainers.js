import React, { useState, useEffect } from "react";
import { getAllTrainers } from "../services/gymService";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Button,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Navbar from "../components/Navbar";
import TrainerModal from "../components/TrainerModal";

export default function Trainers() {
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTrainer, setSelectedTrainer] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [trainerToDelete, setTrainerToDelete] = useState(null);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    try {
      setLoading(true);
      const data = await getAllTrainers();
      setTrainers(data);
      setError(null);
    } catch (err) {
      setError("Αποτυχία φόρτωσης γυμναστών");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (trainer) => {
    setSelectedTrainer(trainer);
    setOpenModal(true);
  };

  const handleDelete = (trainer) => {
    setTrainerToDelete(trainer);
    setConfirmDelete(true);
  };

  const confirmDeleteTrainer = async () => {
    console.log("🗑️ Διαγραφή γυμναστή:", trainerToDelete);
    setConfirmDelete(false);
    await fetchTrainers();
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Λίστα Γυμναστών
        </Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <>
            {trainers.length === 0 ? (
              <Typography>Δεν υπάρχουν γυμναστές</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Όνομα</TableCell>
                      <TableCell>Επώνυμο</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Ειδικότητα</TableCell>
                      <TableCell align="center">Ενέργειες</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {trainers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell>{t.firstName}</TableCell>
                        <TableCell>{t.lastName}</TableCell>
                        <TableCell>{t.email}</TableCell>
                        <TableCell>{t.specialty}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleEdit(t)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(t)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={fetchTrainers}>
              🔄 Ανανέωση
            </Button>
          </>
        )}
      </div>

      {/* Modal Create/Edit Trainer */}
      <TrainerModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        trainer={selectedTrainer}
      />

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          Θέλεις να διαγράψεις τον γυμναστή{" "}
          <b>
            {trainerToDelete?.firstName} {trainerToDelete?.lastName}
          </b>
          ;
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Άκυρο</Button>
          <Button color="error" onClick={confirmDeleteTrainer}>
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
