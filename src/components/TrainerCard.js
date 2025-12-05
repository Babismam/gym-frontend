import React from "react";
import { Card, CardContent, Typography, CardActions, Button } from "@mui/material";

export default function TrainerCard({ trainer, onEdit, onDelete }) {
  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{trainer.firstName} {trainer.lastName}</Typography>
        <Typography color="text.secondary">{trainer.email}</Typography>
        <Typography color="text.secondary">{trainer.phone}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onEdit(trainer)}>✏️ Edit</Button>
        <Button size="small" color="error" onClick={() => onDelete(trainer.id)}>🗑 Delete</Button>
      </CardActions>
    </Card>
  );
}
