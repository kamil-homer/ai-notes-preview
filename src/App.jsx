import { Box } from "@mui/material";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Notes } from "./components/Notes/Notes";
import { useEffect } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./services/supabase-client";
import { useUserState } from "./store/userState";
import { useShallow } from "zustand/react/shallow";

export const App = () => {
  const { user, setUser } = useUserState(
    useShallow((state) => ({
      user: state.user,
      setUser: state.setUser,
    }))
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session.user);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, [setUser]);

  if (!user) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          width: "25vw",
          margin: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          providers={[]}
        />
      </Box>
    );
  } else {
    return (
      <Box
        sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
      >
        <Box sx={{ flex: 1, display: "flex" }}>
          <Box
            elevation={1}
            sx={{
              width: 250,
              p: 2,
              borderRight: "1px solid #e0e0e0",
            }}
          >
            <Sidebar />
          </Box>
          <Box sx={{ flex: 1, p: 3 }}>
            <Notes />
          </Box>
        </Box>
      </Box>
    );
  }
};
