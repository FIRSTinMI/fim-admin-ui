import { FormEvent, useCallback, useContext, useEffect, useState } from "react";
import { SupabaseContext } from "../../supabaseContext";
import { useParams } from "react-router-dom";
import { Failure, Loading, RemoteData, getData, isLoading } from "../../shared/RemoteData";
import { UpdateUser, User, getUserById, updateUser } from "../../data/admin-api";
import { Effect } from "effect";
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, Paper, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";

type FormData = {
  name?: string,
  globalRoles?: Set<string>
}

const globalRoles = [
  "Superuser",
  "Events_Create",
  "Events_Manage",
  "Events_Note",
  "Events_View",
  "Equipment_Manage",
  "Equipment_Note"
];

function UsersManage() {
  const supabase = useContext(SupabaseContext);
  const params = useParams();

  const [user, setUser] = useState<RemoteData<User>>(Loading());
  const [formData, setFormData] = useState<FormData>();
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    setUser(Loading());
    const id = params["id"];
    if (!id) {
      setUser(Failure({ error: new Error("No user ID") }));
    } else {
      (async () => {
        const user = await Effect.runPromise(getUserById(id, (await supabase.auth.getSession()).data.session?.access_token ?? ''));
        setUser(user);
        try {
          const data = getData(user);
          setFormData({
            name: data.name,
            globalRoles: new Set(data.globalRoles)
          });
        } catch (_) {
          // Pass
        }
      })();
    }
  }, [supabase.auth, params]);

  const handleRoleChange = useCallback((role: string, e: FormEvent) => {
    const newRoles = formData?.globalRoles ?? new Set();
    const target = (e.target as HTMLInputElement);
    if (target.checked) {
      newRoles.add(role);
    } else {
      newRoles.delete(role);
    }
    setFormData({
      globalRoles: newRoles,
      ...formData
    });
  }, [formData]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    (async () => {
      await Effect.runPromise(updateUser({
       tempToken: (await supabase.auth.getSession()).data.session?.access_token ?? '',
       id: getData(user).id,
       name: formData?.name,
       globalRoles: Array.from(formData?.globalRoles ?? [])
      } as UpdateUser));
      setIsSaving(false);
    })();
  }, [formData, user, supabase.auth]);

  if (isLoading(user)) return (<>Loading...</>)
  const data = getData(user);

  return (<>
    <h3>Edit {data.email}</h3>
    <Paper sx={{ p: 2 }}>
      <form onSubmit={handleSubmit}>
        <FormControl>
          <TextField
            label="Name"
            autoComplete="off"
            variant="outlined"
            value={formData?.name}
            onChange={(e) => setFormData({...formData, name: (e.target as HTMLInputElement).value})}
          />
        </FormControl>
        <h4>Global Roles</h4>
        <FormGroup>
        {globalRoles.map(role => 
          <FormControlLabel label={role} key={role} control={
            <Checkbox checked={formData?.globalRoles?.has(role)} onChange={e => handleRoleChange(role, e)} />
          } />)}
        </FormGroup>

        <Box sx={{ mt: 2 }}>
          {isSaving ? <LoadingButton loading /> : <Button variant="contained" type="submit">Save</Button>}
        </Box>
      </form>
    </Paper>
  </>);
}

export default UsersManage;