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

export default function ProgramModal({ open, onClose, program }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
  });

  useEffect(() => {
    if (program) setFormData(program);
  }, [program]);

  const handleChange = (e) => {
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleSave = () => {
    console.log("💾 Save program:", formData);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>{program ? "✏️ Επεξεργασία Προγράμματος" : "➕ Νέο Πρόγραμμα"}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12}>
            <TextField
              label="Όνομα Προγράμματος"
              name="name"
              value={formData.name}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Περιγραφή"
              name="description"
              multiline
              rows={3}
              value={formData.description}
              onChange={handleChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Διάρκεια (σε εβδομάδες)"
              name="duration"
              value={formData.duration}
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
