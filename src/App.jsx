import { Box } from "@mui/material";
import { Sidebar } from "./components/Sidebar/Sidebar";
import { Notes } from "./components/Notes/Notes";
import { useEffect, useState } from "react";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "./services/supabase-client";

export const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
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
        <Auth supabaseClient={supabase} appearance={{ theme: ThemeSupa }} />
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
            <Sidebar user={session?.user?.email} />
          </Box>
          <Box sx={{ flex: 1, p: 3 }}>
            <Notes />
          </Box>
        </Box>
      </Box>
    );
  }
};
