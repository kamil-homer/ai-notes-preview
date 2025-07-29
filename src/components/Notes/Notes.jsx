import {
  Box,
  IconButton,
  Input,
  InputAdornment,
  Tooltip,
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
import { generateTitlePrompt } from "../../prompts/prompts";

export const Notes = () => {
  const { id } = useParams();
  const [isGeneratingAiContent, setIsGeneratingAiContent] = useState(false);
  const { notes, currentNoteTitle, setCurrentNoteTitle, currentNotePlainText } =
    useNotesState(
      useShallow((state) => ({
        notes: state.notes,
        currentNoteTitle: state.currentNoteTitle,
        setCurrentNoteTitle: state.setCurrentNoteTitle,
        currentNotePlainText: state.currentNotePlainText,
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
    setIsGeneratingAiContent(true);
    let response;
    try {
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: generateTitlePrompt(currentNotePlainText),
        config: {
          thinkingConfig: {
            thinkingBudget: 0, // Disables thinking
          },
        },
      });
      setCurrentNoteTitle(response.text);
    } catch (error) {
      console.log("Error generating AI title:", error);
    }
    setIsGeneratingAiContent(false);
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
              <Tooltip title="Wygeneruj tytuł przez AI">
                <IconButton
                  onClick={handleAiTitle}
                  loading={isGeneratingAiContent}
                  disabled={false}
                >
                  <AutoAwesomeIcon />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
        />
      </Box>
      <Tiptap />
    </Box>
  );
};
