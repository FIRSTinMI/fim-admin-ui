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
  Alert
} from "@mui/material";
import { useForm } from "@tanstack/react-form";
import { RedirectOnAuthed } from "src/pages/auth/shared.ts";

function UpdatePassword({ sx, ...props }: BoxProps) {
  const [error, setError] = useState<string | null>(null);
  const supabase = useContext(SupabaseContext);
  const navigate = useNavigate();
  const auth = useContext(AuthContext);
  
  useEffect(() => {
    if (auth.isAuthenticated === false) navigate("/auth/login");
  }, [auth.isAuthenticated]);
  
  const form = useForm({
    defaultValues: {
      password: '',
      passwordConfirm: ''
    },
    onSubmit: async ({ value }) => {
      const result = await supabase.auth.updateUser({
        password: value.password
      });
      
      if (result.error) {
        setError(result.error.message);
        throw result.error;
      }
      
      navigate(RedirectOnAuthed);
    }
  });

  return (
    <Box {...props} sx={{ ...sx, display: 'flex', justifyContent: 'center' }}>
      <Card sx={{ width: '35em', maxWidth: 'calc(100vw - 1em)' }}>
        <CardContent>
          <Box sx={{ pb: 4 }}>
            <Typography variant="h3" sx={{ pb: 2 }}>Update Password</Typography>
          </Box>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}>
            <form.Subscribe
              selector={(state) => state.isSubmitSuccessful}
              children={(submitted) => submitted ? <>
                <Alert severity="success">Your password has been updated!</Alert>
              </> : <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <form.Field name="password" validators={{
                onChange: ({ value }) => {
                  if (!value) return 'Enter a password to continue';
                  return undefined;
                }
              }} children={(field) => (
                <div>
                  <InputLabel htmlFor={field.name}>New Password</InputLabel>
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
                    {isSubmitting ? 'Resetting Password...' : 'Update'}
                  </Button>
                )} />
            </Box>} />
            
          </form>
        </CardContent>
      </Card>
    </Box>
  )
}

export default UpdatePassword;