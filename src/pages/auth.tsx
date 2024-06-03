import { Auth as SupaAuth } from '@supabase/auth-ui-react';
import { ThemeMinimal } from '@supabase/auth-ui-shared';
import { useContext, useEffect } from 'react';
import { SupabaseContext } from '../supabaseContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTheme } from '@mui/material';

function Auth() {
  const supabase = useContext(SupabaseContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const theme = useTheme();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const returnUrl = searchParams.get('returnUrl');
        navigate(returnUrl ? returnUrl : '/events');
      }
    })

    return () => subscription.unsubscribe()
  }, [navigate, supabase.auth, searchParams]);

  return (
    <SupaAuth supabaseClient={supabase} appearance={{
      theme: ThemeMinimal,
      variables: {
        default: {
          colors: {
            inputText: theme.palette.text.primary,
            inputPlaceholder: theme.palette.text.disabled,
            inputLabelText: theme.palette.text.primary,
            inputBorder: theme.palette.action.disabled,
            messageBackground: theme.palette.info.main,
            messageText: theme.palette.info.contrastText,
            messageBackgroundDanger: theme.palette.error.main,
            messageTextDanger: theme.palette.error.contrastText,
          },
          space: {
            spaceLarge: theme.spacing(4),
            spaceMedium: theme.spacing(3),
            spaceSmall: theme.spacing(2),
            inputPadding: theme.spacing(1.5),
            labelBottomMargin: theme.spacing(1),
            buttonPadding: theme.spacing(1.5)
          },
          radii: {
            inputBorderRadius: `${theme.shape.borderRadius.toString()}px`,
            buttonBorderRadius: `${theme.shape.borderRadius.toString()}px`
          }
        }
      }
    }} providers={[]} />
  );
}

export default Auth;