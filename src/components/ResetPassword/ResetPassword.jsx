import { useState } from 'react'
import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material'
import { supabase } from '../../services/supabase-client'
import { useNavigate } from 'react-router'

export const ResetPassword = () => {
  const [ newPassword, setNewPassword ] = useState('')
  const [ confirmPassword, setConfirmPassword ] = useState('')
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState('')
  const [ success, setSuccess ] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!newPassword) {
      setError('Podaj nowe hasło')
      return
    }

    if (newPassword.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('Hasła nie są identyczne')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Prosta aktualizacja hasła - Supabase obsługuje wszystko automatycznie
      const { data, error } = await supabase.auth.updateUser({ 
        password: newPassword 
      })

      if (error) throw error

      setSuccess(true)
      
      // Przekieruj do głównej strony po 2 sekundach
      setTimeout(() => {
        navigate('/')
      }, 2000)

    } catch (error) {
      setError(error.message || 'Wystąpił błąd podczas zmiany hasła')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default'
        }}
      >
        <Paper sx={{ p: 4, maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <Typography variant='h5' gutterBottom color='success.main'>
            ✅ Hasło zostało zmienione!
          </Typography>
          <Typography variant='body2' color='text.secondary'>
            Przekierowujemy Cię do aplikacji...
          </Typography>
        </Paper>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default'
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 400, width: '100%' }}>
        <Typography variant='h4' gutterBottom textAlign='center'>
          Resetowanie hasła
        </Typography>
        
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3, textAlign: 'center' }}>
          Podaj nowe hasło dla swojego konta:
        </Typography>

        {error && (
          <Alert severity='error' sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component='form' onSubmit={handleSubmit}>
          <TextField
            fullWidth
            type='password'
            label='Nowe hasło'
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin='normal'
            required
            disabled={loading}
          />
          
          <TextField
            fullWidth
            type='password'
            label='Potwierdź nowe hasło'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin='normal'
            required
            disabled={loading}
          />

          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            {loading ? 'Aktualizuję hasło...' : 'Zmień hasło'}
          </Button>

          <Button
            fullWidth
            variant='text'
            onClick={() => navigate('/')}
            disabled={loading}
          >
            Powrót do aplikacji
          </Button>
        </Box>
      </Paper>
    </Box>
  )
}
