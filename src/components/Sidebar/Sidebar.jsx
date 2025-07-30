import {
  Avatar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import LogoutIcon from "@mui/icons-material/Logout";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase-client";
import { useNotesState } from "../../store/notesState";
import { Link, useParams } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { filterNotes, sortNotesByDate } from "./sidebar-utils";
import { useUserState } from "../../store/userState";

export const Sidebar = ({ onItemClick }) => {
  const { id: currentNoteId } = useParams();
  const { user } = useUserState(
    useShallow((state) => ({
      user: state.user,
    }))
  );

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("error signing out:", error);
    }
  };

  const [searchNotesInput, setSearchNotesInput] = useState("");
  const { notes, setNotes } = useNotesState(
    useShallow((state) => ({
      notes: state.notes,
      setNotes: state.setNotes,
    }))
  );

  useEffect(() => {
    const fetchNotes = async () => {
      console.log("Fetching...");
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("userId", user.id);
      if (error) {
        console.log("Error fetching:", error);
      } else {
        setNotes(data);
      }
    };
    fetchNotes();
  }, [user, setNotes]);

  const notesToDisplay = sortNotesByDate(filterNotes(notes, searchNotesInput));

  return (
    <Box 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        p: 2,
      }}
    >
      <Box 
        sx={{ 
          display: "flex", 
          alignItems: "center", 
          gap: 2, 
          marginBottom: 3 
        }}
      >
        <Avatar>{user?.email?.slice(0, 1).toUpperCase()}</Avatar>
        <Typography noWrap>
          {user?.email}
        </Typography>
      </Box>

      <TextField
        label="Wyszukaj notatki"
        type="search"
        size="small"
        fullWidth
        value={searchNotesInput}
        onChange={(e) => setSearchNotesInput(e.target.value)}
        sx={{ marginBottom: 2 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />

      {/* Notes header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "15px",
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
          Moje notatki
        </Typography>
        <Link to="/" style={{ textDecoration: "none" }}>
          <IconButton size="small" onClick={onItemClick}>
            <AddIcon />
          </IconButton>
        </Link>
      </Box>

      {/* Scrollable notes list */}
      <Box 
        sx={{ 
          flex: 1, 
          overflowY: "auto" 
        }}
      >
        {notesToDisplay.map((note) => {
          const isActive = currentNoteId === note.id.toString();
          
          return (
            <Link
              key={note.id}
              to={`/${note.id}`}
              style={{ textDecoration: "none" }}
              onClick={onItemClick}
            >
              <Paper
                elevation={isActive ? 3 : 1}
                sx={{
                  padding: 2,
                  margin: "5px 5px 10px 5px"
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    marginBottom: 1,
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'primary.main' : '#1a1a1a',
                    fontSize: '0.9rem',
                    lineHeight: 1.4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {note.title || "Bez tytułu"}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  {note.tag && (
                    <Chip 
                      label={note.tag} 
                      size="small" 
                      sx={{
                        backgroundColor: isActive ? 'primary.main' : '#e3f2fd',
                        color: isActive ? 'white' : 'primary.main',
                        fontWeight: 500,
                        fontSize: '0.75rem',
                        height: '24px',
                        borderRadius: '6px',
                        '& .MuiChip-label': {
                          paddingX: '8px',
                        },
                      }}
                    />
                  )}
                  <Typography 
                    variant="caption" 
                    sx={{
                      color: isActive ? 'primary.main' : '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 500 : 400,
                      flexShrink: 0,
                    }}
                  >
                    {new Date(note.updated_at).toLocaleDateString('pl-PL', {
                      day: '2-digit',
                      month: '2-digit',
                    })}
                  </Typography>
                </Box>
              </Paper>
            </Link>
          );
        })}
      </Box>

      <Divider sx={{ marginBottom: 2 }} />
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={logOut}
        fullWidth
        sx={{ 
          textTransform: 'none',
          borderColor: '#e0e0e0',
          color: '#666',
          '&:hover': {
            borderColor: '#d32f2f',
            backgroundColor: '#ffebee',
          }
        }}
      >
        Wyloguj
      </Button>
    </Box>
  );
};
