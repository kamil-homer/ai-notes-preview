import {
  Avatar,
  Box,
  Chip,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import { useEffect, useState } from "react";
import { supabase } from "../../services/supabase-client";
import { useNotesState } from "../../store/notes-state";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";
import { filterNotes, sortNotesByDate } from "./sidebar-utils";
import SettingsIcon from "@mui/icons-material/Settings";

export const Sidebar = ({ user }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = async () => {
    setAnchorEl(null);
  };

  const logOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("error signing out:", error);
    }
    handleClose();
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
      const { data, error } = await supabase.from("notes").select("*");
      if (error) {
        console.log("Error fetching:", error);
      } else {
        setNotes(data);
      }
    };
    fetchNotes();
  }, []);

  const notesToDisplay = sortNotesByDate(filterNotes(notes, searchNotesInput));

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "15px",
          marginBottom: "25px",
        }}
      >
        <Avatar>{user?.slice(0, 1).toUpperCase()}</Avatar>
        <Typography
          onClick={handleClick}
          sx={{
            overflow: "hidden",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            cursor: "pointer",
          }}
        >
          {user}
        </Typography>
        <Menu
          dense
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={logOut}>Wyloguj</MenuItem>
        </Menu>
      </Box>
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
      />
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "5px",
        }}
      >
        <Typography>Moje notatki</Typography>
        <Link to="/" style={{ textDecoration: "none" }}>
          <IconButton>
            <AddIcon />
          </IconButton>
        </Link>
      </Box>
      {notesToDisplay.map((note) => (
        <Link
          key={note.id}
          to={`/${note.id}`}
          style={{ textDecoration: "none" }}
        >
          <Paper
            elevation={3}
            sx={{
              marginBottom: "10px",
              padding: "15px",
            }}
          >
            <Typography variant="subtitle2">{note.title}</Typography>
            {/* <Typography variant="body2">{note.content}</Typography> */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "15px",
              }}
            >
              <Chip label={note.tag} size="small" color="success" />
              <Typography variant="caption">
                {/* {new Date(note.createdAt).toLocaleDateString()} */}
              </Typography>
            </Box>
          </Paper>
        </Link>
      ))}
    </Box>
  );
};
