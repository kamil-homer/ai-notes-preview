import { 
  Box, 
  Drawer, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography,
  useMediaQuery,
  useTheme,
  CircularProgress
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import { Sidebar } from './components/Sidebar/Sidebar'
import { Notes } from './components/Notes/Notes'
import { Auth } from './components/Auth/Auth'
import { AppTitle } from './components/AppTitle/AppTitle'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { supabase } from './services/supabase-client'
import { useUserState } from './store/userState'
import { useNotesState } from './store/notesState'
import { useShallow } from 'zustand/react/shallow'

const drawerWidth = 280
const actionBarHeight = 56

export const App = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [ drawerOpen, setDrawerOpen ] = useState(false)
  const [ isLoading, setIsLoading ] = useState(true)
  const navigate = useNavigate()
  const { id } = useParams()

  const { user, setUser } = useUserState(
    useShallow((state) => ({
      user: state.user,
      setUser: state.setUser,
    }))
  )

  const { notes } = useNotesState(
    useShallow((state) => ({
      notes: state.notes,
    }))
  )

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })
    
    return () => subscription.unsubscribe()
  }, [ setUser ])

  useEffect(() => {
    if (!isLoading && !user && id) {
      navigate('/', { replace: true })
    }
  }, [ user, id, navigate, isLoading ])

  // Sprawdź czy ID istnieje w notatkach (tylko gdy user zalogowany i notatki załadowane)
  useEffect(() => {
    if (!isLoading && user && id && notes.length > 0) {
      const noteExists = notes.some((note) => note.id == id)
      if (!noteExists) {
        navigate('/', { replace: true })
      }
    }
  }, [ user, id, notes, navigate, isLoading ])

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen)
  }


  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#fafafa',
        }}
      >
        <CircularProgress size={40} />
      </Box>
    )
  }

  if (!user && !isLoading) {
    return <Auth />
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh' }}>
      {isMobile && (
        <AppBar 
          position='fixed' 
          sx={{ 
            zIndex: theme.zIndex.drawer + 1,
            backgroundColor: 'white',
            color: 'black',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          <Toolbar>
            <IconButton
              color='inherit'
              aria-label='open drawer'
              edge='start'
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <AppTitle variant='h6' component='div' sx={{ textAlign: 'left' }} />
          </Toolbar>
        </AppBar>
      )}

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? drawerOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            marginTop: isMobile ? `${actionBarHeight}px` : 0,
            height: isMobile ? `calc(100dvh - ${actionBarHeight}px)` : '100dvh',
            overflowY: 'auto',
            borderRight: '1px solid #e0e0e0',
          },
        }}
      >
        <Sidebar onItemClick={() => isMobile && setDrawerOpen(false)} />
      </Drawer>

      <Box
        component='main'
        sx={{
          flexGrow: 1,
          p: 3,
          marginTop: isMobile ? `${actionBarHeight}px` : 0,
          marginLeft: isMobile ? 0 : 0,
          minHeight: '100dvh',
          overflowY: 'auto',
        }}
      >
        <Notes />
      </Box>
    </Box>
  )
}
