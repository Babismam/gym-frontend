import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";

export default function MemberModal({ open, onClose, onSave }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
    setFormData({ firstName: "", lastName: "", email: "", phone: "" });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>➕ Προσθήκη Μέλους</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Όνομα"
          name="firstName"
          margin="normal"
          value={formData.firstName}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Επώνυμο"
          name="lastName"
          margin="normal"
          value={formData.lastName}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Email"
          name="email"
          margin="normal"
          value={formData.email}
          onChange={handleChange}
        />
        <TextField
          fullWidth
          label="Τηλέφωνο"
          name="phone"
          margin="normal"
          value={formData.phone}
          onChange={handleChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Ακύρωση</Button>
        <Button variant="contained" onClick={handleSave}>
          Αποθήκευση
        </Button>
      </DialogActions>
    </Dialog>
  );
}
