import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
} from "@mui/material";

export default function TrainerModal({ open, onClose, trainer }) {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    specialty: "",
  });

  useEffect(() => {
    if (trainer) setFormData(trainer);
  }, [trainer]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    console.log("💾 Save trainer:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{trainer ? "✏️ Επεξεργασία Γυμναστή" : "➕ Νέος Γυμναστής"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={6}>
            <TextField
              label="Όνομα"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Επώνυμο"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Ειδικότητα"
              name="specialty"
              value={formData.specialty}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Άκυρο</Button>
        <Button variant="contained" onClick={handleSave}>
          Αποθήκευση
        </Button>
      </DialogActions>
    </Dialog>
  );
}
