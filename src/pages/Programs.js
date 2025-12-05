import React, { useState, useEffect } from "react";
import { getAllPrograms } from "../services/gymService";
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
import ProgramModal from "../components/ProgramModal";

export default function Programs() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [programToDelete, setProgramToDelete] = useState(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const data = await getAllPrograms();
      setPrograms(data);
    } catch (err) {
      setError("Αποτυχία φόρτωσης προγραμμάτων");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (p) => {
    setSelectedProgram(p);
    setOpenModal(true);
  };

  const handleDelete = (p) => {
    setProgramToDelete(p);
    setConfirmDelete(true);
  };

  const confirmDeleteProgram = async () => {
    console.log("🗑️ Διαγραφή προγράμματος:", programToDelete);
    setConfirmDelete(false);
    await fetchPrograms();
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Λίστα Προγραμμάτων
        </Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <>
            {programs.length === 0 ? (
              <Typography>Δεν υπάρχουν προγράμματα</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Όνομα</TableCell>
                      <TableCell>Περιγραφή</TableCell>
                      <TableCell>Διάρκεια</TableCell>
                      <TableCell align="center">Ενέργειες</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {programs.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>{p.name}</TableCell>
                        <TableCell>{p.description}</TableCell>
                        <TableCell>{p.duration}</TableCell>
                        <TableCell align="center">
                          <IconButton color="primary" onClick={() => handleEdit(p)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="error" onClick={() => handleDelete(p)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button variant="contained" sx={{ mt: 2 }} onClick={fetchPrograms}>
              🔄 Ανανέωση
            </Button>
          </>
        )}
      </div>

      <ProgramModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        program={selectedProgram}
      />

      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          Θέλεις να διαγράψεις το πρόγραμμα <b>{programToDelete?.name}</b>;
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Άκυρο</Button>
          <Button color="error" onClick={confirmDeleteProgram}>
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
