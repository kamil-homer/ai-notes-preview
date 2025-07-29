import {
  Box,
  Container,
  IconButton,
  Input,
  InputAdornment,
  InputLabel,
  Typography,
} from "@mui/material";
import { Tiptap } from "../Tiptap/Tiptap";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

import { useNotesState } from "../../store/notes-state";
import { useParams } from "react-router";
import { NoteButtons } from "../NoteButtons/NoteButtons";

import "./notes.css";
import { useShallow } from "zustand/react/shallow";
import { useEffect, useState } from "react";
import { ai } from "../../services/ai-studio-client";

export const Notes = () => {
  const { id } = useParams();
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);
  const { notes, currentNoteTitle, setCurrentNoteTitle } = useNotesState(
    useShallow((state) => ({
      notes: state.notes,
      currentNoteTitle: state.currentNoteTitle,
      setCurrentNoteTitle: state.setCurrentNoteTitle,
    }))
  );

  const selectedNote = id ? notes.find((note) => note.id == id) : null;
  useEffect(() => {
    if (selectedNote) {
      setCurrentNoteTitle(selectedNote.title);
    }
    return () => setCurrentNoteTitle("");
  }, [selectedNote]);

  const handleAiTitle = async () => {
    console.log("calling ai");
    setIsGeneratingAiContent(true);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Napisz mi tytuł dla następującego posta: 'To jest mój post o React i o jego nauce'.
        Maksymalnie 3 wyrazy.
        Przykłady dobrych tematów: "Notatki ze spotkania", "Lista zakupów", "Ksiązki i blogi"`,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      },
    });
    setIsGeneratingAiContent(false);
    console.log(response);
    setCurrentNoteTitle(response.text);
  };

  const modificationDate = selectedNote
    ? new Date(selectedNote.updated_at).toLocaleDateString()
    : new Date().toLocaleDateString();

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption">{modificationDate}</Typography>
        <NoteButtons />
      </Box>
      <Box>
        <Input
          type="text"
          placeholder="Podaj nowy tytuł"
          sx={{ marginBottom: "20px", borderBottom: "none", width: "100%" }}
          className="titleInput"
          value={currentNoteTitle}
          onChange={(e) => setCurrentNoteTitle(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <IconButton
                onClick={handleAiTitle}
                loading={isGeneratingAiContent}
              >
                <AutoAwesomeIcon />
              </IconButton>
            </InputAdornment>
          }
        />
      </Box>
      <Tiptap />
    </Box>
  );
};
