import { Box, Button, IconButton, Tooltip } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotesState } from "../../store/notes-state";
import { supabase } from "../../services/supabase-client";
import { memo } from "react";
import { useNavigate, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { useUserState } from "../../store/userState";

const NoteButtonsComponent = () => {
  const navigation = useNavigate();
  const { id } = useParams();

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
    let noteTag = "";

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
  };

  const handleDelete = async () => {
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
  };

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Tooltip title="Zapisz notatkę">
        <IconButton
          onClick={handleSave}
          disabled={!currentNoteContent || !currentNoteTitle}
          color="primary"
        >
          <SaveIcon />
        </IconButton>
      </Tooltip>
      {id && (
        <Tooltip title="Usuń notatkę">
          <IconButton 
            onClick={handleDelete}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
};

export const NoteButtons = memo(NoteButtonsComponent);
