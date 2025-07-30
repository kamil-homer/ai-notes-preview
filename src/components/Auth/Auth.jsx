import { useState, useEffect } from 'react';
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

// Helper function to translate error messages
const getErrorMessage = (error) => {
  const errorMessages = {
    'Invalid login credentials': 'Nieprawidłowy email lub hasło',
    'Email not confirmed': 'Email nie został potwierdzony. Sprawdź swoją skrzynkę pocztową.',
    'Password should be at least 6 characters': 'Hasło musi mieć co najmniej 6 znaków',
    'Unable to validate email address: invalid format': 'Nieprawidłowy format adresu email',
    'Email address not authorized': 'Adres email nie jest autoryzowany',
    'Email rate limit exceeded': 'Przekroczono limit wysyłania emaili. Spróbuj ponownie później.',
    'Signup is disabled': 'Rejestracja jest wyłączona',
    'User already registered': 'Użytkownik o tym adresie email już istnieje',
  };
  
  return errorMessages[error] || error;
};

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Validation state - tylko pokazuj błędy po interakcji użytkownika
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  // Validation logic
  const isEmailValid = email.includes('@') && email.includes('.');
  const isPasswordValid = password.length >= 6;
  const isFormValid = isEmailValid && isPasswordValid;

  // Debounced validation - pokaż błąd 1.5s po przestaniu pisać
  useEffect(() => {
    if (!emailTouched) return;
    
    const timer = setTimeout(() => {
      setShowEmailError(!isEmailValid && email.length > 0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [email, emailTouched, isEmailValid]);

  useEffect(() => {
    if (!passwordTouched) return;
    
    const timer = setTimeout(() => {
      setShowPasswordError(!isPasswordValid && password.length > 0);
    }, 1500);

    return () => clearTimeout(timer);
  }, [password, passwordTouched, isPasswordValid]);

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailTouched(true);
    // Ukryj błąd podczas pisania
    setShowEmailError(false);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordTouched(true);
    // Ukryj błąd podczas pisania
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
      setError(getErrorMessage(error.message));
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
      setError(getErrorMessage(error.message));
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
        padding: { xs: 1, sm: 2 },
      }}
    >
      <Card
        sx={{
          maxWidth: 420,
          width: '100%',
          boxShadow: {
            xs: 'none',
            sm: '0 8px 32px rgba(0, 0, 0, 0.1)',
          },
          borderRadius: { xs: 0, sm: 2 },
          backgroundColor: 'white',
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              textAlign: 'center',
              fontWeight: 'light',
              color: 'text.primary',
              mb: 1,
              fontSize: { xs: '1.75rem', sm: '2.125rem' },
            }}
          >
            AI Notes
          </Typography>

          <Typography
            variant="body2"
            sx={{
              textAlign: 'center',
              color: 'text.secondary',
              mb: 4,
              fontSize: '0.875rem',
            }}
          >
            Inteligentne notatki z pomocą AI
          </Typography>

          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{
              textAlign: 'center',
              color: 'text.primary',
              mb: 3,
              fontWeight: 'medium',
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
            }}
          >
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
              margin="normal"
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
              size="medium"
              error={showEmailError}
              helperText={showEmailError ? 'Wprowadź prawidłowy adres e-mail' : ' '}
              slotProps={{
                formHelperText: {
                  sx: {
                    minHeight: '20px',
                    margin: '3px 14px 0',
                  }
                }
              }}
              sx={{ 
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <TextField
              margin="normal"
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
              size="medium"
              error={showPasswordError}
              helperText={showPasswordError ? 'Hasło musi mieć co najmniej 6 znaków' : ' '}
              slotProps={{
                formHelperText: {
                  sx: {
                    minHeight: '20px',
                    margin: '3px 14px 0',
                  }
                }
              }}
              sx={{ 
                mt: 0,
                mb: 3,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 1,
                mb: 2,
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textTransform: 'none',
                borderRadius: 2,
                fontWeight: 'medium',
                boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.4)',
                },
                '&:disabled': {
                  boxShadow: 'none',
                },
              }}
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
                  sx={{
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontSize: '0.875rem',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    '&:disabled': {
                      color: 'text.disabled',
                    },
                  }}
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
                  // Reset validation state
                  setEmailTouched(false);
                  setPasswordTouched(false);
                  setShowEmailError(false);
                  setShowPasswordError(false);
                }}
                disabled={loading}
                sx={{
                  textTransform: 'none',
                  fontWeight: 'medium',
                  fontSize: '0.9rem',
                  minHeight: 'auto',
                  padding: '4px 8px',
                }}
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
