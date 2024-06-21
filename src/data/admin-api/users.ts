import { FimSupabaseClient } from "../../supabaseContext";

export type User = {
  id: string,
  name: string,
  email: string,
  globalPermissions: string[]
};

export const getUsers = async (client: FimSupabaseClient, searchTerm: string): Promise<User[]> => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/users?searchTerm=${encodeURIComponent(searchTerm)}`, {
    headers: {
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(resp => resp.json());
}

export const getUserById = async (client: FimSupabaseClient, id: string): Promise<User> => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/users/${encodeURIComponent(id)}`, {
    headers: {
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  }).then(resp => resp.json());
}

export type UpdateUser = {
  readonly id: string,
  readonly name?: string,
  readonly globalPermissions?: string[]
}

export const updateUser = async (client: FimSupabaseClient, req: UpdateUser) => {
  return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/users/${encodeURIComponent(req.id)}`, {
    method: "PUT",
    body: JSON.stringify({
      name: req.name,
      newPermissions: req.globalPermissions
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`
    }
  });
}