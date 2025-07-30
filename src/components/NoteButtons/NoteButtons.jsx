import { Box, Button, IconButton, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotesState } from "../../store/notes-state";
import { supabase } from "../../services/supabase-client";
import { memo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useUserState } from "../../store/userState";

const NoteButtonsComponent = () => {
  const navigation = useNavigate();
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const { user } = useUserState(
    useShallow((state) => ({
      user: state.user,
    }))
  );

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
  );

  const handleSave = async () => {
    setIsSaving(true);
    let noteTag = "";
    // try {
    //   const noteTagResponse = await ai.models.generateContent({
    //     model: "gemini-2.5-flash",
    //     contents: generateTagPrompt(currentNotePlainText),
    //     config: {
    //       thinkingConfig: {
    //         thinkingBudget: 0, // Disables thinking
    //       },
    //     },
    //   });
    //   noteTag = noteTagResponse.text;
    // } catch (error) {
    //   console.log("Error generating AI title:", error);
    // }

    const newEntry = {
      userId: user.id,
      title: currentNoteTitle,
      content: currentNoteContent,
      plainTextContent: currentNotePlainText,
      tag: noteTag,
      updated_at: new Date(),
    };

    if (!id) {
      const { data, error } = await supabase
        .from("notes")
        .insert([newEntry])
        .single()
        .select();
      if (data) {
        addNote(data);
        navigation(`/${data.id}`);
      }
      console.log(data, error);
    } else {
      const { data, error } = await supabase
        .from("notes")
        .update(newEntry)
        .eq("id", id)
        .select();
      if (data) {
        updateNote(data[0], id);
      }
      console.log(data, error);
    }
    setIsSaving(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const { data, error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id)
      .select();
    if (data) {
      removeNote(data[0]);
        navigation(`/`);
    }
    console.log(data, error);
    
    setIsDeleting(false);
  };

  return (
    <Box 
      sx={{ 
        display: "flex", 
        gap: { xs: "8px", sm: "12px" },
        flexShrink: 0,
      }}
    >
      <Tooltip title="Zapisz notatkę" arrow placement="top">
        <IconButton
          loading={isSaving}
          onClick={handleSave}
          disabled={!currentNoteContent || !currentNoteTitle}
          sx={{ 
            padding: { xs: '8px', sm: '10px' },
            backgroundColor: 'primary.main',
            color: 'white',
            borderRadius: '10px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.3)',
            '&:hover': {
              backgroundColor: 'primary.dark',
              boxShadow: '0 3px 10px rgba(25, 118, 210, 0.4)',
            },
            '&:disabled': {
              backgroundColor: '#e0e0e0',
              color: '#9e9e9e',
              boxShadow: 'none',
            },
          }}
        >
          <SaveIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {id && (
        <Tooltip title="Usuń notatkę" arrow placement="top">
          <IconButton 
            loading={isDeleting} 
            onClick={handleDelete}
            sx={{ 
              padding: { xs: '8px', sm: '10px' },
              backgroundColor: '#fff',
              color: '#d32f2f',
              border: '1px solid #ffcdd2',
              borderRadius: '10px',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: '#ffebee',
                borderColor: '#ef5350',
                color: '#c62828',
                boxShadow: '0 3px 8px rgba(211, 47, 47, 0.2)',
              },
              '&:disabled': {
                backgroundColor: '#f5f5f5',
                color: '#bdbdbd',
                borderColor: '#e0e0e0',
                boxShadow: 'none',
              },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export const NoteButtons = memo(NoteButtonsComponent);
