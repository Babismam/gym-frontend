import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

export default function ProgramCard({ program }) {
  return (
    <Card sx={{ margin: 2, minWidth: 250 }}>
      <CardContent>
        <Typography variant="h6">{program.name}</Typography>
        <Typography variant="body2">{program.description}</Typography>
        <Typography variant="caption">Διάρκεια: {program.duration}</Typography>
      </CardContent>
    </Card>
  );
}
