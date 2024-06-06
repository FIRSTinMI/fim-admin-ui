import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UpdateUser, getUserById, updateUser } from "../../data/admin-api";
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, Paper, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSupaQuery } from "../../useSupaQuery";
import { Loading } from "../../shared/Loading";
import { useSupaMutation } from "../../useSupaMutation";
import { useQueryClient } from "@tanstack/react-query";

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
  const params = useParams();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<FormData | undefined>(undefined);

  const getUserQuery = useSupaQuery({
    queryKey: ['user', params['id']],
    queryFn: (client) => {
      const id = params['id'];
      if (!id) return Promise.resolve(null);
      return getUserById(client, id);
    }
  });

  const updateUserMutation = useSupaMutation({
    mutationFn: (client, formData: FormData) => {
      const id = params['id'];
      if (!id) return Promise.resolve(null);

      return updateUser(client, {
        id: id,
        name: formData.name,
        globalRoles: formData.globalRoles ? Array.from(formData.globalRoles) : []
      } as UpdateUser);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['user', params['id']] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    }
  });

  useEffect(() => {
    setFormData({
      name: getUserQuery.data?.name,
      globalRoles: new Set(getUserQuery.data?.globalRoles)
    });
  }, [getUserQuery.data]);

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
    if (!formData) return;
    console.log('hs', formData);
    updateUserMutation.mutate(formData);
  }, [formData, updateUserMutation]);

  if (getUserQuery.isLoading || !formData?.name) return (<Loading />);
  const data = getUserQuery.data;

  return (<>
    <h3>Edit {data?.email}</h3>
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
          {updateUserMutation.isPending ? <LoadingButton loading /> : <Button variant="contained" type="submit">Save</Button>}
        </Box>
      </form>
    </Paper>
  </>);
}

export default UsersManage;