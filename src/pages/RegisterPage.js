import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/authService';
import {
  Container, Box, Typography, TextField, Button,
  CircularProgress, Alert, Avatar, Grid, Paper,
  FormControlLabel, Checkbox, Divider, MenuItem
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';


const fieldStyle = {
  sx: {
    minHeight: '80px', 
  }
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    username: '', password: '', confirmPassword: '', dateOfBirth: '',
    membershipType: '',
    membershipDuration: '',
    customStartDate: '',
    customEndDate: ''
  });
  const [privacyPolicy, setPrivacyPolicy] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const errorMessages = [];
    if (!formData.firstName) { errorMessages.push('• Το Όνομα είναι υποχρεωτικό.'); }
    if (!formData.lastName) { errorMessages.push('• Το Επώνυμο είναι υποχρεωτικό.'); }
    if (!formData.username) { errorMessages.push('• Το Όνομα Χρήστη είναι υποχρεωτικό.'); }
    if (!formData.password) { errorMessages.push('• Ο Κωδικός Πρόσβασης είναι υποχρεωτικός.'); }
    if (!formData.email) { errorMessages.push('• Το Email είναι υποχρεωτικό.'); }
    if (!formData.membershipType) { errorMessages.push('• Το είδος συνδρομής είναι υποχρεωτικό.'); }
    
    if (formData.membershipType !== 'PERSONAL' && !formData.membershipDuration) {
        errorMessages.push('• Η διάρκεια συνδρομής είναι υποχρεωτική.');
    }
    if (formData.membershipDuration === 'CUSTOM' && (!formData.customStartDate || !formData.customEndDate)) {
        errorMessages.push('• Οι προσαρμοσμένες ημερομηνίες είναι υποχρεωτικές.');
    }
    if (formData.customStartDate && formData.customEndDate && formData.customStartDate > formData.customEndDate) {
        errorMessages.push('• Η έναρξη δεν μπορεί να είναι μετά τη λήξη.');
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) { errorMessages.push('• Η διεύθυνση email δεν είναι έγκυρη.'); }

    const phoneRegex = /^\d{10}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) { errorMessages.push('• Ο αριθμός τηλεφώνου πρέπει να έχει 10 ψηφία.'); }
    
    if (!formData.dateOfBirth) {
        errorMessages.push('• Η ημερομηνία γέννησης είναι υποχρεωτική.');
    } else {
        const birthDate = new Date(formData.dateOfBirth);
        const cutoffDate = new Date();
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 18);
        if (birthDate > cutoffDate) {
            errorMessages.push('• Πρέπει να είστε τουλάχιστον 18 ετών.');
        }
    }
    
    if (formData.password !== formData.confirmPassword) { errorMessages.push('• Οι κωδικοί πρόσβασης δεν ταιριάζουν.'); }
    if (!privacyPolicy) { errorMessages.push('• Πρέπει να αποδεχτείτε την Πολιτική Απορρήτου.'); }

    return errorMessages;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }
    setLoading(true);
    try {
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      alert('Η εγγραφή σας ολοκληρώθηκε με επιτυχία! Μπορείτε τώρα να συνδεθείτε.');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Προέκυψε ένα άγνωστο σφάλμα.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <PublicNavbar />
      <Container component="main" maxWidth="md" sx={{ my: 4, flexGrow: 1 }}>
        <Paper elevation={6} sx={{ p: { xs: 2, md: 4 } }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}><PersonAddIcon /></Avatar>
            <Typography component="h1" variant="h4" gutterBottom>Δημιουργία Λογαριασμού</Typography>
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              
              <Typography variant="h6" gutterBottom align="center">Προσωπικά Στοιχεία</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField name="firstName" required fullWidth label="Όνομα" onChange={handleChange} autoFocus {...fieldStyle} /></Grid>
                <Grid item xs={12} sm={6}><TextField required fullWidth label="Επώνυμο" name="lastName" onChange={handleChange} {...fieldStyle} /></Grid>
                <Grid item xs={12} sm={6}><TextField required fullWidth label="Διεύθυνση Email" name="email" type="email" onChange={handleChange} {...fieldStyle} /></Grid>
                <Grid item xs={12} sm={6}><TextField fullWidth name="phone" label="Αριθμός Τηλεφώνου" id="phone" onChange={handleChange} {...fieldStyle} /></Grid>
                <Grid item xs={12}><TextField name="dateOfBirth" required fullWidth label="Ημερομηνία Γέννησης" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} {...fieldStyle} /></Grid>
              </Grid>
              
              <Typography variant="h6" gutterBottom align="center" sx={{ mt: 4 }}>Στοιχεία Λογαριασμού</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField required fullWidth label="Όνομα Χρήστη (Username)" name="username" onChange={handleChange} {...fieldStyle} /></Grid>
                <Grid item xs={12} sm={6}><TextField required fullWidth name="password" label="Κωδικός Πρόσβασης" type="password" onChange={handleChange} {...fieldStyle} /></Grid>
                <Grid item xs={12} sm={6}><TextField required fullWidth name="confirmPassword" label="Επιβεβαίωση Κωδικού" type="password" onChange={handleChange} {...fieldStyle} /></Grid>
              </Grid>

              <Typography variant="h6" gutterBottom align="center" sx={{ mt: 4 }}>Στοιχεία Συνδρομής</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required
                    label="Είδος Συνδρομής"
                    name="membershipType"
                    value={formData.membershipType}
                    onChange={handleChange}
                    {...fieldStyle}
                  >
                    <MenuItem value="FULL">Full</MenuItem>
                    <MenuItem value="BASIC">Basic</MenuItem>
                    <MenuItem value="PERSONAL">Personal Trainer</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    required={formData.membershipType !== 'PERSONAL'}
                    label="Διάρκεια"
                    name="membershipDuration"
                    value={formData.membershipDuration}
                    onChange={handleChange}
                    disabled={formData.membershipType === 'PERSONAL'}
                    {...fieldStyle}
                  >
                    <MenuItem value="3-MONTH">3μηνη</MenuItem>
                    <MenuItem value="6-MONTH">6μηνη</MenuItem>
                    <MenuItem value="12-MONTH">12μηνη</MenuItem>
                    <MenuItem value="CUSTOM">Προσαρμοσμένη</MenuItem>
                  </TextField>
                </Grid>
                {formData.membershipDuration === 'CUSTOM' && (
                    <>
                        <Grid item xs={12} sm={6}>
                            <TextField name="customStartDate" required fullWidth label="Έναρξη" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.customStartDate} {...fieldStyle} />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField name="customEndDate" required fullWidth label="Λήξη" type="date" InputLabelProps={{ shrink: true }} onChange={handleChange} value={formData.customEndDate} {...fieldStyle} />
                        </Grid>
                    </>
                )}
              </Grid>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%', mt: 1 }}>
                <FormControlLabel control={<Checkbox color="primary" checked={privacyPolicy} onChange={(e) => setPrivacyPolicy(e.target.checked)} />} label="Συμφωνώ με την Πολιτική Απορρήτου." />
              </Box>

              {error && <Alert severity="error" sx={{ width: '100%', mt: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
              <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 1, py: 1.5 }} disabled={loading}>{loading ? <CircularProgress size={24} /> : 'Δημιουργια'}</Button>
              <Button component={Link} to="/login" fullWidth variant="outlined">Έχετε ήδη λογαριασμό; Είσοδος</Button>
            </Box>
          </Box>
        </Paper>
      </Container>
      <Footer />
    </Box>
  );
}