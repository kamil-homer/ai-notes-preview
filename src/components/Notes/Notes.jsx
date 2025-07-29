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

export const Notes = () => {
  const { id } = useParams();

  const { notes, currentNoteTitle, setCurrentNoteTitle } = useNotesState(
    useShallow((state) => ({
      notes: state.notes,
      currentNoteTitle: state.currentNoteTitle,
      setCurrentNoteTitle: state.setCurrentNoteTitle,
    }))
  );

  const selectedNote = notes.find((note) => note.id == id);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="caption">{new Date().toDateString()}</Typography>
        <NoteButtons />
      </Box>
      <Box>
        <Input
          id="standard-adornment-password"
          type={"text"}
          placeholder="Podaj tytuł"
          sx={{ marginBottom: "20px", borderBottom: "none" }}
          className="titleInput"
          value={selectedNote ? selectedNote.title : currentNoteTitle}
          onChange={(e) => setCurrentNoteTitle(e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <IconButton onClick={() => console.log("AI call...")}>
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
