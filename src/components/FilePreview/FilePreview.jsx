import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material'
import { fileService } from '../../services/file-service'

export const FilePreview = ({ file, open, onClose }) => {
  const [ loading, setLoading ] = useState(false)
  const [ error, setError ] = useState('')
  const [ fileUrl, setFileUrl ] = useState('')

  // Sprawdź czy plik można wyświetlić w przeglądarce
  const isPreviewable = (contentType) => {
    return (
      contentType?.startsWith('image/') ||
      contentType?.startsWith('text/') ||
      contentType === 'application/pdf' ||
      contentType === 'text/plain'
    )
  }

  // Załaduj URL pliku gdy dialog się otwiera
  const handleOpen = async () => {
    if (!file || !open) return

    setLoading(true)
    setError('')
    
    try {
      const url = await fileService.getFileUrl(file.filePath)
      setFileUrl(url)
    } catch (err) {
      setError('Nie można załadować pliku')
      console.error('Error loading file preview:', err)
    } finally {
      setLoading(false)
    }
  }

  // Resetuj stan gdy dialog się zamyka
  const handleClose = () => {
    setFileUrl('')
    setError('')
    setLoading(false)
    onClose()
  }

  // Uruchom ładowanie gdy dialog się otwiera
  useEffect(() => {
    if (open) {
      handleOpen()
    }
  }, [ open, file ])

  const renderPreview = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (error) {
      return <Alert severity='error'>{error}</Alert>
    }

    if (!fileUrl) return null

    const contentType = file.contentType

    // Obrazy
    if (contentType?.startsWith('image/')) {
      return (
        <Box sx={{ textAlign: 'center', p: 2 }}>
          <img
            src={fileUrl}
            alt={file.fileName}
            style={{
              maxWidth: '100%',
              maxHeight: '500px',
              objectFit: 'contain'
            }}
          />
        </Box>
      )
    }

    // PDF
    if (contentType === 'application/pdf') {
      return (
        <Box sx={{ width: '100%', height: '500px' }}>
          <iframe
            src={fileUrl}
            width='100%'
            height='100%'
            style={{ border: 'none' }}
            title={file.fileName}
          />
        </Box>
      )
    }

    // Tekst
    if (contentType?.startsWith('text/') || contentType === 'text/plain') {
      return (
        <Box sx={{ p: 2 }}>
          <iframe
            src={fileUrl}
            width='100%'
            height='400px'
            style={{ border: '1px solid #ddd' }}
            title={file.fileName}
          />
        </Box>
      )
    }

    // Inne typy plików - tylko informacja
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant='h6' gutterBottom>
          {file.fileName}
        </Typography>
        <Typography color='text.secondary' gutterBottom>
          Typ: {contentType || 'Nieznany'}
        </Typography>
        <Typography color='text.secondary' gutterBottom>
          Rozmiar: {(file.fileSize / 1024 / 1024).toFixed(2)} MB
        </Typography>
        <Button
          variant='contained'
          onClick={() => window.open(fileUrl, '_blank')}
          sx={{ mt: 2 }}
        >
          Pobierz plik
        </Button>
      </Box>
    )
  }

  if (!file) return null

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: { maxHeight: '80vh' }
      }}
    >
      <DialogTitle>
        {file.fileName}
        {!isPreviewable(file.contentType) && (
          <Typography variant='caption' display='block' color='text.secondary'>
            Podgląd niedostępny dla tego typu pliku
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {renderPreview()}
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose}>
          Zamknij
        </Button>
        <Button 
          variant='contained' 
          onClick={() => window.open(fileUrl, '_blank')}
          disabled={!fileUrl}
        >
          Pobierz
        </Button>
      </DialogActions>
    </Dialog>
  )
}
