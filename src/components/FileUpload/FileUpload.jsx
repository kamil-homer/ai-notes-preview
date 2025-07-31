import { useState } from 'react'
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'
import VisibilityIcon from '@mui/icons-material/Visibility'
import { fileService } from '../../services/file-service'
import { FilePreview } from '../FilePreview/FilePreview'

export const FileUpload = ({ noteId, userId, files = [], onFilesChange }) => {
  const [ uploading, setUploading ] = useState(false)
  const [ error, setError ] = useState('')
  const [ previewFile, setPreviewFile ] = useState(null)
  const [ showPreview, setShowPreview ] = useState(false)

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Limit rozmiaru pliku (np. 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Plik jest za duży. Maksymalny rozmiar to 10MB.')
      return
    }

    setUploading(true)
    setError('')

    try {
      const uploadedFile = await fileService.uploadFile(file, userId, noteId)
      onFilesChange([ ...files, uploadedFile ])
    } catch (error) {
      setError('Błąd podczas przesyłania pliku')
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  const handleFileDelete = async (file) => {
    try {
      await fileService.deleteFile(file.id, file.filePath)
      onFilesChange(files.filter(f => f.id !== file.id))
    } catch (error) {
      setError('Błąd podczas usuwania pliku')
      console.error(error)
    }
  }

  const handleFileDownload = async (file) => {
    try {
      const url = await fileService.getFileUrl(file.filePath)
      window.open(url, '_blank')
    } catch (error) {
      setError('Błąd podczas pobierania pliku')
      console.error(error)
    }
  }

  const handleFilePreview = (file) => {
    setPreviewFile(file)
    setShowPreview(true)
  }

  const handleClosePreview = () => {
    setShowPreview(false)
    setPreviewFile(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = [ 'B', 'KB', 'MB', 'GB' ]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Button
          component='label'
          variant='outlined'
          startIcon={uploading ? <CircularProgress size={16} /> : <AttachFileIcon />}
          disabled={uploading}
        >
          {uploading ? 'Przesyłanie...' : 'Dodaj plik'}
          <input
            type='file'
            hidden
            onChange={handleFileUpload}
            accept='.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar'
          />
        </Button>
      </Box>

      {error && (
        <Alert severity='error' sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {files.length > 0 && (
        <List dense>
          {files.map((file) => (
            <ListItem key={file.id} divider>
              <ListItemText
                primary={file.fileName}
                secondary={formatFileSize(file.fileSize)}
              />
              <ListItemSecondaryAction>
                <IconButton
                  size='small'
                  onClick={() => handleFilePreview(file)}
                  title='Podgląd pliku'
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  size='small'
                  onClick={() => handleFileDownload(file)}
                  title='Otwórz plik w nowej karcie'
                >
                  <DownloadIcon />
                </IconButton>
                <IconButton
                  size='small'
                  color='error'
                  onClick={() => handleFileDelete(file)}
                  title='Usuń plik'
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      )}

      {files.length === 0 && (
        <Typography variant='body2' color='text.secondary' sx={{ fontStyle: 'italic' }}>
          Brak załączników
        </Typography>
      )}

      {/* Dialog podglądu pliku */}
      <FilePreview
        file={previewFile}
        open={showPreview}
        onClose={handleClosePreview}
      />
    </Box>
  )
}
