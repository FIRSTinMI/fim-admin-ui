import React, { useContext, useState } from 'react'

import { SupabaseContext } from "src/supabaseContext.tsx";
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

function ForgotPassword({ sx, ...props }: BoxProps) {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const supabase = useContext(SupabaseContext);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`
      })
      if (error) throw error
      
      setSuccess(true); 
    } catch (error: unknown) {
      setSuccess(false);
      setError(error instanceof Error ? error.message : 'An error occurred');
      setIsLoading(false);
    }
  }

  return (
    <Box {...props} sx={{ ...sx, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '35em', maxWidth: 'calc(100vw - 1em)' }}>
        <CardContent>
          <Typography variant="h3" sx={{ pb: 2 }}>Forgot Password</Typography>
          {success ?
            <div>
              <Typography>If your email matched an existing account, you will receive a password reset email.</Typography>
            </div> : 
            <form onSubmit={handleSubmit}>
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
                  
                {error && <Alert severity="error">{error}</Alert>}
                <Button type="submit" fullWidth variant="contained" disabled={isLoading}>
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                <Typography variant="body1">
                  Don&apos;t have an account?{' '}
                  <Link component={RouterLink} to="../register">
                    Sign up
                  </Link>
                </Typography>
              </Box>
            </form>
          }
        </CardContent>
      </Card>
    </Box>
  )
}

export default ForgotPassword;