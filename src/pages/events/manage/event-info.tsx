import { LoadingButton } from "@mui/lab";
import { Box, Button, TextField } from "@mui/material";
import { useForm } from "@tanstack/react-form";

function EventsManageEventInfo() {
  const form = useForm({
    defaultValues: {
      name: '',
      code: null,
      syncSource: null
    },
    onSubmit: (props) => {
      console.log(props);
    }
  });

  return (<>
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <form.Field name="name" children={({ state, handleChange, handleBlur }) => (
        <TextField
          label="Name"
          defaultValue={state.value}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={handleBlur} />
        )}
      />

      <Box sx={{ mt: 2 }}>
        {form.state.isSubmitting ? <LoadingButton loading /> : <Button variant="contained" type="submit">Save</Button>}
      </Box>
    </form>
  </>);
}

export default EventsManageEventInfo;