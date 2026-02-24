import { useContext, useEffect, useState } from 'react'

import { AuthContext, SupabaseContext } from "src/supabaseContext.tsx";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  BoxProps,
  Button,
  Card,
  CardContent,
  TextField,
  InputLabel,
  Typography,
  Link,
  Alert
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { RedirectOnAuthed } from "src/pages/auth/shared.ts";

function Login({ sx, ...props }: BoxProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = useContext(SupabaseContext);
  const auth = useContext(AuthContext);
  const [searchParams, _] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (auth.isAuthenticated) {
      const returnUrl = searchParams.get('returnUrl');
      navigate(returnUrl ? returnUrl : RedirectOnAuthed, {replace: true});
    }
  }, [auth.isAuthenticated])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Intentionally keep isLoading === true, the effect for supabase.isAuthenticated should redirect us shortly... 
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  return (
    <Box {...props} sx={{ ...sx, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '35em', maxWidth: 'calc(100vw - 1em)' }}>
        <CardContent>
          <Typography variant="h3" sx={{ pb: 2 }}>Log In to FiM Admin</Typography>
          <form onSubmit={handleLogin}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div>
                <InputLabel htmlFor="email">Email</InputLabel>
                <TextField
                  id="email"
                  type="email"
                  placeholder="jdoe@firstinmichigan.us"
                  required
                  value={email}
                  fullWidth
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <div>
                  <InputLabel htmlFor="password">Password</InputLabel>
                </div>
                <TextField
                  id="password"
                  type="password"
                  required
                  value={password}
                  fullWidth
                  onChange={(e) => setPassword(e.target.value)}
                />
                <Link component={RouterLink} to="../forgot-password">
                  Forgot your password?
                </Link>
              </div>
                
              {error && <Alert severity="error">{error}</Alert>}
              <Button type="submit" fullWidth variant="contained" disabled={isLoading}>
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>
              <Typography variant="body1">
                Don&apos;t have an account?{' '}
                <Link component={RouterLink} to="../register">
                  Sign up
                </Link>
              </Typography>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Login;