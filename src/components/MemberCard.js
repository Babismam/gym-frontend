import React from "react";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  Button,
} from "@mui/material";

export default function MemberCard({ member, onEdit, onDelete }) {
  return (
    <Card sx={{ minWidth: 275, mb: 2 }}>
      <CardContent>
        <Typography variant="h6">
          {member.firstName} {member.lastName}
        </Typography>
        <Typography color="text.secondary">{member.email}</Typography>
        <Typography color="text.secondary">{member.phone}</Typography>
      </CardContent>
      <CardActions>
        <Button size="small" onClick={() => onEdit(member)}>✏️ Edit</Button>
        <Button size="small" color="error" onClick={() => onDelete(member.id)}>🗑 Delete</Button>
      </CardActions>
    </Card>
  );
}
