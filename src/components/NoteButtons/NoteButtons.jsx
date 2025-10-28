import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import InfoOutlineIcon from '@mui/icons-material/InfoOutlined'
import { supabase } from '../../services/supabase-client'
import { useNotesState } from '../../store/notesState'
import { useUserState } from '../../store/userState'
import { useParams, useNavigate } from 'react-router'
import { useShallow } from 'zustand/react/shallow'
import { useState, memo } from 'react'
import { generateAIContent } from '../../services/ai-studio-client'
import { generateTagPrompt } from '../../prompts/prompts'

const NoteButtonsComponent = () => {
  const navigation = useNavigate()
  const { id } = useParams()

  const [ isInfoDialogOpen, setIsInfoDialogOpen ] = useState(false)
  const [ isSaving, setIsSaving ] = useState(false)

  const { user } = useUserState(
    useShallow((state) => ({
      user: state.user,
    }))
  )

  const {
    addNote,
    removeNote,
    currentNoteTitle,
    currentNoteContent,
    currentNotePlainText,
    updateNote,
  } = useNotesState(
    useShallow((state) => ({
      addNote: state.addNote,
      removeNote: state.removeNote,
      currentNoteTitle: state.currentNoteTitle,
      currentNoteContent: state.currentNoteContent,
      currentNotePlainText: state.currentNotePlainText,
      updateNote: state.updateNote,
    }))
  )

  const handleSave = async () => {
    setIsSaving(true)

    try {
      let noteTag = 'Ogólne'
      
      if (!id && currentNotePlainText && currentNotePlainText.trim().length > 10) {
        try {
          noteTag = await generateAIContent(generateTagPrompt(currentNotePlainText))
        } catch (aiError) {
          console.log('Błąd podczas generowania tagu:', aiError)
        }
      }

      if (!id) {
        const newEntry = {
          userId: user.id,
          title: currentNoteTitle,
          content: currentNoteContent,
          plainTextContent: currentNotePlainText,
          tag: noteTag,
          updated_at: new Date(),
        }
        const { data, error } = await supabase
          .from('notes')
          .insert([ newEntry ])
          .single()
          .select()
        if (data) {
          addNote(data)
          navigation(`/${data.id}`)
        }
        console.log(data, error)
      } else {
        const updateEntry = {
          userId: user.id,
          title: currentNoteTitle,
          content: currentNoteContent,
          plainTextContent: currentNotePlainText,
          updated_at: new Date(),
        }
        
        const { data, error } = await supabase
          .from('notes')
          .update(updateEntry)
          .eq('id', id)
          .single()
          .select()
        if (data) {
          updateNote(data, id)
        }
        console.log(data, error)
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania notatki:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    const { data, error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)
      .single()
      .select()
    if (data) {
      removeNote(data)
      navigation(`/`)
    }
    console.log(data, error)
  }

  return (
    <Box sx={{ display: 'flex', gap: 1 }}>
      <Tooltip title='Instrukcje markdown'>
        <IconButton
          onClick={()=>setIsInfoDialogOpen(true)}
          color='primary'
        >
          <InfoOutlineIcon />
        </IconButton>
      </Tooltip>
      <Tooltip title='Zapisz notatkę'>
        <IconButton
          onClick={handleSave}
          disabled={!currentNoteContent || !currentNoteTitle || isSaving}
          color='primary'
        >
          {isSaving ? (
            <CircularProgress size={24} />
          ) : (
            <SaveOutlinedIcon />
          )}
        </IconButton>
      </Tooltip>
      {id && (
        <Tooltip title='Usuń notatkę'>
          <IconButton 
            onClick={handleDelete}
            color='error'
          >
            <DeleteOutlinedIcon />
          </IconButton>
        </Tooltip>
      )}
      <Dialog onClose={()=>setIsInfoDialogOpen(false)} open={isInfoDialogOpen} fullWidth maxWidth='xs'>
        <DialogTitle>Formatowanie tekstu</DialogTitle>
        <DialogContent>
          <Typography variant='body2' component='div' sx={{ mb: 2 }}>
            <strong>Nagłówki:</strong><br />
            <code># Nagłówek 1</code><br />
            <code>## Nagłówek 2</code><br />
            <code>### Nagłówek 3</code>
          </Typography>

          <Typography variant='body2' component='div' sx={{ mb: 2 }}>
            <strong>Tekst:</strong><br />
            <code>**pogrubiony tekst**</code><br />
            <code>*kursywa*</code><br />
            <code>Cmd/Ctrl + B</code> - pogrubienie<br />
            <code>Cmd/Ctrl + I</code> - kursywa
          </Typography>

          <Typography variant='body2' component='div' sx={{ mb: 2 }}>
            <strong>Listy:</strong><br />
            <code>- element listy</code><br />
            <code>* element listy</code><br />
            <code>1. lista numerowana</code>
          </Typography>

          <Typography variant='body2' component='div' sx={{ mb: 2 }}>
            <strong>Inne:</strong><br />
            <code>&gt; cytat</code><br />
            <code>`kod inline`</code><br />
            <code>```</code><br />
            <code>blok kodu</code><br />
            <code>```</code>
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export const NoteButtons = memo(NoteButtonsComponent)
