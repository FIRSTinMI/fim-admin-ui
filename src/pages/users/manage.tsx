import { FormEvent, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { UpdateUser, getUserById, updateUser } from "src/data/admin-api/users";
import { Box, Button, Checkbox, FormControl, FormControlLabel, FormGroup, Paper, TextField } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useSupaQuery } from "src/hooks/useSupaQuery";
import { Loading } from "src/shared/Loading";
import { useSupaMutation } from "src/hooks/useSupaMutation";
import { useQueryClient } from "@tanstack/react-query";

type FormData = {
  name?: string,
  globalPermissions?: Set<string>
}

const globalPermissions = [
  "Superuser",
  "Events_Create",
  "Events_Manage",
  "Events_Note",
  "Events_View",
  "Equipment_View",
  "Equipment_Manage",
  "Equipment_Note",
  "Equipment_Av_ManageStream"
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
        globalPermissions: formData.globalPermissions ? Array.from(formData.globalPermissions) : []
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
      globalPermissions: new Set(getUserQuery.data?.globalPermissions)
    });
  }, [getUserQuery.data]);

  const handlePermissionChange = useCallback((permission: string, e: FormEvent) => {
    const newPermissions = formData?.globalPermissions ?? new Set();
    const target = (e.target as HTMLInputElement);
    if (target.checked) {
      newPermissions.add(permission);
    } else {
      newPermissions.delete(permission);
    }
    setFormData({
      globalPermissions: newPermissions,
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
        {globalPermissions.map(permission => 
          <FormControlLabel label={permission} key={permission} control={
            <Checkbox checked={formData?.globalPermissions?.has(permission)} onChange={e => handlePermissionChange(permission, e)} />
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