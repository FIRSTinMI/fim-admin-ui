import { useContext, useEffect, useState } from 'react'

import { AuthContext, SupabaseContext } from "src/supabaseContext.tsx";
import { useNavigate } from "react-router-dom";
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
import { useForm } from "@tanstack/react-form";
import { RedirectOnAuthed } from "src/pages/auth/shared.ts";

function Register({ sx, ...props }: BoxProps) {
  const [error, setError] = useState<string | null>(null)
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
      passwordConfirm: ''
    },
    onSubmit: async ({ value }) => {
      const result = await supabase.auth.signUp({
        email: value.email,
        password: value.password,
        options: {
          emailRedirectTo: window.location.origin
        }
      });
      
      if (result.error) {
        setError(result.error.message);
        throw result.error;
      }
    }
  })
  const supabase = useContext(SupabaseContext);
  const auth = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (auth.isAuthenticated) navigate(RedirectOnAuthed, { replace: true });
  }, [auth.isAuthenticated]);

  return (
    <Box {...props} sx={{ ...sx, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '35em', maxWidth: 'calc(100vw - 1em)' }}>
        <CardContent>
          <Box sx={{ pb: 4 }}>
            <Typography variant="h3" sx={{ pb: 2 }}>Create an Account</Typography>
            <Typography>An admin will need to grant you access before you can see event information.</Typography>
            <Typography>Already have an account? Sign in <Link component={RouterLink} to="../login">here</Link>.</Typography>
          </Box>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}>
            <form.Subscribe
              selector={(state) => state.isSubmitSuccessful}
              children={(submitted) => submitted ? <>
                <Alert severity="success">Check your email for a link to verify your account!</Alert>
              </> : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <form.Field name="email" validators={{
                onChange: ({ value }) => {
                  if (!value) return 'An email address is required to sign up';
                  if (value.indexOf('@') < 0) return 'Please enter a valid email address';
                  return undefined;
                }
              }} children={(field) => (
                <div>
                  <InputLabel htmlFor={field.name}>Email</InputLabel>
                  <TextField
                    id={field.name}
                    type="email"
                    placeholder="jdoe@firstinmichigan.us"
                    required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={!field.state.meta.isValid}
                    helperText={field.state.meta.errors.join(", ")}
                    fullWidth
                  />
                </div>)} />
              <form.Field name="password" validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Enter a password to continue';
                  return undefined;
                }
              }} children={(field) => (
                <div>
                  <InputLabel htmlFor={field.name}>Password</InputLabel>
                  <TextField
                    id={field.name}
                    type="password"
                    // required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={!field.state.meta.isValid}
                    helperText={field.state.meta.errors.join(", ")}
                    fullWidth
                  />
                </div>)} />
              <form.Field name="passwordConfirm" validators={{
                onChangeListenTo: ["password"],
                onChange: ({ value, fieldApi }) => {
                  if (value !== fieldApi.form.getFieldValue("password")) return "Passwords do not match"
                  return undefined;
                }
              }} children={(field) => (
                <div>
                  <InputLabel htmlFor={field.name}>Confirm Password</InputLabel>
                  <TextField
                    id={field.name}
                    type="password"
                    // required
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={!field.state.meta.isValid}
                    helperText={field.state.meta.errors.join(", ")}
                    fullWidth
                  />
                </div>)} />

              {error && <Alert severity="error">{error}</Alert>}

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
                children={([canSubmit, isSubmitting, isPristine]) => (
                  <Button type="submit" fullWidth variant="contained" disabled={!canSubmit || isPristine}>
                    {isSubmitting ? 'Creating account...' : 'Register'}
                  </Button>
                )} />
            </Box>} />
            
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default Register;