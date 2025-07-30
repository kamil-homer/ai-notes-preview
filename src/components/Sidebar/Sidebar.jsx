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
import { useNotesState } from "../../store/notes-state";
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
      {/* Header z avatarem */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <Avatar>{user?.email?.slice(0, 1).toUpperCase()}</Avatar>
        <Typography
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            cursor: "pointer",
            flex: 1,
          }}
        >
          {user?.email}
        </Typography>
      </Box>

      {/* Search field */}
      <TextField
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
        label="Wyszukaj notatki"
        type="search"
        value={searchNotesInput}
        onChange={(e) => setSearchNotesInput(e.target.value)}
        sx={{ marginBottom: "15px" }}
        size="small"
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
          overflowY: 'auto',
          marginBottom: 2,
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#c1c1c1',
            borderRadius: '10px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: '#a8a8a8',
          },
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
                elevation={0}
                sx={{
                  marginBottom: "12px",
                  padding: "16px",
                  cursor: 'pointer',
                  border: isActive ? '2px solid' : '2px solid #e0e0e0',
                  borderColor: isActive ? 'primary.main' : '#e0e0e0',
                  borderRadius: '12px',
                  backgroundColor: isActive ? '#f3f6ff' : '#ffffff',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  '&:hover': {
                    backgroundColor: isActive ? '#e8f1ff' : '#f8f9fa',
                    borderColor: isActive ? 'primary.dark' : '#d0d7de',
                    boxShadow: isActive 
                      ? '0 2px 8px rgba(25, 118, 210, 0.12)' 
                      : '0 2px 8px rgba(0, 0, 0, 0.08)',
                  },
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
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
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
                        color: isActive ? 'white' : '#1565c0',
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

      {/* Logout button na dole */}
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
