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
  }, [selectedNote, setCurrentNoteTitle]);

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
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: { xs: 'wrap', sm: 'nowrap' },
          gap: { xs: 1, sm: 0 },
          marginBottom: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary">
          {modificationDate}
        </Typography>
        <NoteButtons />
      </Box>
      <Box sx={{ marginBottom: 3 }}>
        <Input
          type="text"
          placeholder="Podaj nowy tytuł"
          sx={{ 
            marginBottom: "20px", 
            borderBottom: "2px solid #e0e0e0", 
            width: "100%",
            fontSize: { xs: '1.1rem', sm: '1.3rem' },
            fontWeight: 500,
            padding: "12px 0",
            transition: 'border-color 0.2s ease',
            '&:hover': {
              borderBottomColor: '#bdbdbd',
            },
            '&:focus-within': {
              borderBottomColor: 'primary.main',
            },
            '&::before, &::after': {
              display: 'none',
            },
          }}
          className="titleInput"
          value={currentNoteTitle}
          onChange={(e) => setCurrentNoteTitle(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <Tooltip title="Wygeneruj tytuł przez AI" arrow placement="top">
                <IconButton
                  onClick={handleAiTitle}
                  loading={isGeneratingAiContent}
                  disabled={!currentNotePlainText || isGeneratingAiContent}
                  size="small"
                  sx={{
                    marginRight: 1,
                    backgroundColor: isGeneratingAiContent ? '#f5f5f5' : '#667eea',
                    color: isGeneratingAiContent ? '#999' : 'white',
                    borderRadius: '8px',
                    padding: '8px',
                    transition: 'all 0.2s ease',
                    border: '1px solid #667eea',
                    '&:hover': {
                      backgroundColor: isGeneratingAiContent ? '#f5f5f5' : '#5a6fd8',
                      borderColor: '#5a6fd8',
                    },
                    '&:disabled': {
                      backgroundColor: '#f5f5f5',
                      color: '#ccc',
                      borderColor: '#e0e0e0',
                    },
                  }}
                >
                  <AutoAwesomeIcon 
                    fontSize="medium"
                  />
                </IconButton>
              </Tooltip>
            </InputAdornment>
          }
        />
      </Box>
      <Box sx={{ width: '100%', overflow: 'hidden' }}>
        <Tiptap />
      </Box>
    </Box>
  );
};
