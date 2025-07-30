import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Link,
  Divider,
  CircularProgress,
} from '@mui/material';
import { supabase } from '../../services/supabase-client';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Validation state
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Validation logic
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setShowEmailError(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setShowPasswordError(false);
  };

  const handleEmailBlur = () => {
    // Pokaż błąd natychmiast po utracie focusa jeśli pole nie jest puste
    if (email.length > 0) {
      setShowEmailError(!isEmailValid);
    }
  };

  const handlePasswordBlur = () => {
    // Pokaż błąd natychmiast po utracie focusa jeśli pole nie jest puste
    if (password.length > 0) {
      setShowPasswordError(!isPasswordValid);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      if (isLogin) {
        // Logowanie
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        setMessage('Zalogowano pomyślnie!');
      } else {
        // Rejestracja
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (error) throw error;
        setMessage('Sprawdź swoją skrzynkę e-mail w celu weryfikacji konta.');
      }
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Wprowadź adres e-mail aby zresetować hasło');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      setMessage('Instrukcje resetowania hasła zostały wysłane na Twój e-mail.');
    } catch (error) {
      setError(error.message);
    }
    
    setLoading(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fafafa',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ textAlign: 'center' }}>
            AI Notes
          </Typography>

          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 4 }}>
            Inteligentne notatki z pomocą AI
          </Typography>

          <Typography variant="h6" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
            {isLogin ? 'Zaloguj się' : 'Utwórz konto'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              required
              fullWidth
              id="email"
              label="Adres e-mail"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={handleEmailChange}
              onBlur={handleEmailBlur}
              disabled={loading}
              error={showEmailError}
              helperText={showEmailError ? 'Wprowadź prawidłowy adres e-mail' : ''}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              name="password"
              label="Hasło"
              type="password"
              id="password"
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              value={password}
              onChange={handlePasswordChange}
              onBlur={handlePasswordBlur}
              disabled={loading}
              error={showPasswordError}
              helperText={showPasswordError ? 'Hasło musi mieć co najmniej 6 znaków' : ''}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 1, mb: 2, py: 1.5 }}
              disabled={loading || !isFormValid}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                isLogin ? 'Zaloguj się' : 'Utwórz konto'
              )}
            </Button>

            {isLogin && (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Zapomniałeś hasła?
                </Link>
              </Box>
            )}

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
                lub
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {isLogin ? 'Nie masz konta?' : 'Masz już konto?'}
              </Typography>
              <Button
                type="button"
                variant="text"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setMessage('');
                  setEmail('');
                  setPassword('');
                  setShowEmailError(false);
                  setShowPasswordError(false);
                }}
                disabled={loading}
              >
                {isLogin ? 'Utwórz konto' : 'Zaloguj się'}
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
