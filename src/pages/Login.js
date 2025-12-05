import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";
import {
  Container, Box, Typography, TextField, Button,
  CircularProgress, Alert, Avatar
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { handleLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(username, password);
      handleLogin(data);

      if (data.role === "ADMIN") {
        navigate("/admin-dashboard");
      } else if (data.role === "TRAINER") {
        navigate("/trainer-dashboard");
      } else {
        navigate("/member-dashboard");
      }
    } catch (err) {
      setError(err.message || "Προέκυψε ένα άγνωστο σφάλμα.");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <Container component="main" maxWidth="xs" sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Είσοδος
          </Typography>
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Όνομα Χρήστη"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Κωδικός Πρόσβασης"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && (
              <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                {error}
              </Alert>
            )}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 1 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Είσοδος"}
            </Button>
            <Button
              component={Link}
              to="/register"
              fullWidth
              variant="outlined"
              sx={{ mb: 2 }}
            >
              Δεν έχετε λογαριασμό; Εγγραφή
            </Button>
          </Box>
        </Box>
      </Container>
      <Footer />
    </Box>
  );
}