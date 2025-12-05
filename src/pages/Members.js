import React, { useState, useEffect } from "react";
import { getAllMembers } from "../services/gymService";
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
import MemberModal from "../components/MemberModal";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await getAllMembers();
      setMembers(data);
      setError(null);
    } catch (err) {
      setError("Αποτυχία φόρτωσης μελών");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setOpenModal(true);
  };

  const handleDelete = (member) => {
    setMemberToDelete(member);
    setConfirmDelete(true);
  };

  const confirmDeleteMember = async () => {
    try {
      console.log("Διαγραφή μέλους:", memberToDelete);
      setConfirmDelete(false);
      setMemberToDelete(null);
      await fetchMembers();
    } catch (err) {
      console.error("Αποτυχία διαγραφής:", err);
    }
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <Typography variant="h4" gutterBottom>
          Λίστα Μελών
        </Typography>

        {loading && <CircularProgress />}
        {error && <Typography color="error">{error}</Typography>}

        {!loading && !error && (
          <>
            {members.length === 0 ? (
              <Typography>Δεν υπάρχουν μέλη</Typography>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Όνομα</TableCell>
                      <TableCell>Επώνυμο</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Τηλέφωνο</TableCell>
                      <TableCell align="center">Ενέργειες</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.firstName}</TableCell>
                        <TableCell>{m.lastName}</TableCell>
                        <TableCell>{m.email}</TableCell>
                        <TableCell>{m.phone}</TableCell>
                        <TableCell align="center">
                          <IconButton
                            color="primary"
                            onClick={() => handleEdit(m)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(m)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            <Button
              variant="contained"
              color="primary"
              sx={{ marginTop: 2 }}
              onClick={fetchMembers}
            >
              🔄 Ανανέωση
            </Button>
          </>
        )}
      </div>

      <MemberModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        member={selectedMember}
      />

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
      >
        <DialogTitle>Επιβεβαίωση Διαγραφής</DialogTitle>
        <DialogContent>
          Θέλεις σίγουρα να διαγράψεις το μέλος{" "}
          <b>{memberToDelete?.firstName} {memberToDelete?.lastName}</b>;
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete(false)}>Άκυρο</Button>
          <Button color="error" onClick={confirmDeleteMember}>
            Διαγραφή
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}