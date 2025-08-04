import {
  Box,
  IconButton,
  Input,
  InputAdornment,
  Tooltip,
  Typography,
  Divider,
} from '@mui/material'
import { Tiptap } from '../Tiptap/Tiptap'
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined'
import { useNotesState } from '../../store/notesState'
import { useParams } from 'react-router'
import { NoteButtons } from '../NoteButtons/NoteButtons'
import { FileUpload } from '../FileUpload/FileUpload'
import { fileService } from '../../services/file-service'
import { useUserState } from '../../store/userState'

import { useShallow } from 'zustand/react/shallow'
import { useEffect, useState } from 'react'
import { generateAIContent } from '../../services/ai-studio-client'
import { generateTitlePrompt } from '../../prompts/prompts'

import './notes.css'

export const Notes = () => {
  const { id } = useParams()
  const [ isGeneratingAiContent, setIsGeneratingAiContent ] = useState(false)
  const [ files, setFiles ] = useState([])
  
  const { user } = useUserState(useShallow((state) => ({ user: state.user })))
  
  const { notes, currentNoteTitle, setCurrentNoteTitle, currentNotePlainText } =
    useNotesState(
      useShallow((state) => ({
        notes: state.notes,
        currentNoteTitle: state.currentNoteTitle,
        setCurrentNoteTitle: state.setCurrentNoteTitle,
        currentNotePlainText: state.currentNotePlainText,
      }))
    )

  const selectedNote = id ? notes.find((note) => note.id == id) : null
  
  useEffect(() => {
    if (selectedNote) {
      setCurrentNoteTitle(selectedNote.title)
    }
    return () => setCurrentNoteTitle('')
  }, [ selectedNote, setCurrentNoteTitle ])

  // Załaduj pliki dla notatki
  useEffect(() => {
    if (id) {
      loadFiles()
    } else {
      setFiles([])
    }
  }, [ id ])

  const loadFiles = async () => {
    try {
      const noteFiles = await fileService.getFilesForNote(id)
      setFiles(noteFiles)
    } catch (error) {
      console.error('Error loading files:', error)
    }
  }

  const handleAiTitle = async () => {
    setIsGeneratingAiContent(true)
    try {
      const aiTitle = await generateAIContent(generateTitlePrompt(currentNotePlainText))
      setCurrentNoteTitle(aiTitle)
    } catch (error) {
      console.log('Error generating AI title:', error)
    }
    setIsGeneratingAiContent(false)
  }

  const modificationDate = selectedNote
    ? new Date(selectedNote.updated_at).toLocaleDateString()
    : new Date().toLocaleDateString()

  return (
    <Box>
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 2 
        }}
      >
        <Typography variant='caption' color='text.secondary'>
          {modificationDate}
        </Typography>
        <NoteButtons />
      </Box>
      <Box sx={{ marginBottom: 3 }}>
        <Input
          className='titleInput'
          type='text'
          placeholder='Podaj nowy tytuł'
          fullWidth
          value={currentNoteTitle}
          onChange={(e) => setCurrentNoteTitle(e.target.value)}
          startAdornment={
            <InputAdornment position='start'>
              <Tooltip title='Wygeneruj tytuł przez AI'>
                <IconButton
                  onClick={handleAiTitle}
                  disabled={!currentNotePlainText || isGeneratingAiContent}
                  size='small'
                  color='primary'
                >
                  <AutoAwesomeOutlinedIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
        />
      </Box>
      
      <Tiptap />
      
      {/* Załączniki - tylko dla istniejących notatek */}
      {id && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='h6' gutterBottom>
            Załączniki
          </Typography>
          <FileUpload
            noteId={id}
            userId={user?.id}
            files={files}
            onFilesChange={setFiles}
          />
        </Box>
      )}

      {/* Informacja dla nowych notatek */}
      {!id && (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant='h6' gutterBottom>
            Załączniki
          </Typography>
          <Box sx={{ 
            p: 3, 
            bgcolor: 'action.hover', 
            borderRadius: 1,
            textAlign: 'center'
          }}>
            <Typography variant='body2' color='text.secondary'>
              Zapisz notatkę, aby móc dodawać pliki
            </Typography>
            <Typography variant='caption' color='text.secondary' sx={{ mt: 1, display: 'block' }}>
              Upload plików dostępny jest po pierwszym zapisaniu notatki
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  )
}
