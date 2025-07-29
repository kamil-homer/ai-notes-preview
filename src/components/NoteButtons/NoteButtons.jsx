import { Box, Button, IconButton } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNotesState } from "../../store/notes-state";
import { supabase } from "../../services/supabase-client";
import { memo, useState } from "react";
import { useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

const NoteButtonsComponent = () => {
  const { id } = useParams();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    addNote,
    removeNote,
    currentNoteTitle,
    currentNoteContent,
    currentNotePlainText,
  } = useNotesState(
    useShallow((state) => ({
      addNote: state.addNote,
      removeNote: state.removeNote,
      currentNoteTitle: state.currentNoteTitle,
      currentNoteContent: state.currentNoteContent,
      currentNotePlainText: state.currentNotePlainText,
    }))
  );

  const handleSave = async () => {
    setIsSaving(true);
    // generate by AI
    const noteTag = "";

    const newEntry = {
      title: currentNoteTitle,
      content: currentNoteContent,
      plainTextContent: currentNotePlainText,
      tag: noteTag,
    };

    if (!id) {
      const { data, error } = await supabase
        .from("notes")
        .insert([newEntry])
        .single()
        .select();
      if (data) {
        addNote(data);
      }
      console.log(data, error);
    } else {
      const { data, error } = await supabase
        .from("notes")
        .update(newEntry)
        .eq("id", id)
        .select();
      if (data) {
        addNote(data);
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
    }
    console.log(data, error);
    setIsDeleting(false);
  };

  return (
    <Box sx={{ display: "flex", gap: "5px" }}>
      <IconButton
        loading={isSaving}
        onClick={handleSave}
        disabled={!currentNoteContent || !currentNoteTitle}
      >
        <SaveIcon />
      </IconButton>
      <IconButton loading={isDeleting} onClick={handleDelete}>
        <DeleteIcon />
      </IconButton>
    </Box>
  );
};

export const NoteButtons = memo(NoteButtonsComponent);
