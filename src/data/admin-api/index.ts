import { Effect, Request, RequestResolver } from "effect";
import { Failure, RemoteData, Success } from "../../shared/RemoteData";

export type User = {
  id: string,
  name: string,
  email: string,
  globalRoles: string[]
};

const internalGetUsers = (searchTerm: string, tempToken: string) => Effect.tryPromise({
  try: () => 
    fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/users?searchTerm=${encodeURIComponent(searchTerm)}`, {
      headers: {
        Authorization: `Bearer ${tempToken}`
      }
    }).then(async resp => Success({ data: (await resp.json()) as User[] })),
  catch: (error: unknown) => Failure({ error: error as Error })
}).pipe(Effect.withRequestCaching(true))

export interface GetUsers extends Request.Request<RemoteData<User[]>, RemoteData<User[]>> {
  readonly _tag: "GetUsers",
  readonly searchTerm: string,
  readonly tempToken: string
}

export const GetUsers = Request.tagged<GetUsers>("GetUsers")

export const GetUsersResolver = RequestResolver.fromEffect((req: GetUsers) => internalGetUsers(req.searchTerm, req.tempToken))

export const getUsers = (searchTerm: string, tempToken: string) => Effect.request(
  GetUsers({
    searchTerm,
    tempToken
  }),
  GetUsersResolver
).pipe(Effect.withRequestCaching(true));

const internalGetUserById = (id: string, tempToken: string) => Effect.tryPromise({
  try: () => 
    fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/users/${encodeURIComponent(id)}`, {
      headers: {
        Authorization: `Bearer ${tempToken}`
      }
    }).then(async resp => Success({ data: (await resp.json()) as User })),
  catch: (error: unknown) => Failure({ error: error as Error })
}).pipe(Effect.withRequestCaching(true))

export interface GetUserById extends Request.Request<RemoteData<User>, RemoteData<User>> {
  readonly _tag: "GetUserById",
  readonly id: string,
  readonly tempToken: string
}

export const GetUserById = Request.tagged<GetUserById>("GetUserById")

export const GetUserByIdResolver = RequestResolver.fromEffect((req: GetUserById) => internalGetUserById(req.id, req.tempToken))

export const getUserById = (id: string, tempToken: string) => Effect.request(
  GetUserById({
    id,
    tempToken
  }),
  GetUserByIdResolver
).pipe(Effect.withRequestCaching(true));

export interface UpdateUser extends Request.Request<RemoteData<null>, RemoteData<null>> {
  readonly _tag: "UpdateUser",
  readonly id: string,
  readonly name?: string,
  readonly globalRoles?: string[],
  readonly tempToken: string
}

const internalUpdateUser = (req: UpdateUser, tempToken: string) => Effect.tryPromise({
  try: () => 
    fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/users/${encodeURIComponent(req.id)}`, {
      method: "PUT",
      body: JSON.stringify({
        name: req.name,
        newRoles: req.globalRoles
      }),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${tempToken}`
      }
    }).then(async resp => resp.ok ? Success({ data: null }) : Failure({ error: new Error(resp.statusText) })),
  catch: (error: unknown) => Failure({ error: error as Error })
});

export const UpdateUser = Request.tagged<UpdateUser>("UpdateUser")

export const UpdateUserResolver = RequestResolver.fromEffect((req: UpdateUser) => internalUpdateUser(req, req.tempToken))

export const updateUser = (req: UpdateUser) => Effect.request(
  UpdateUser(req),
  UpdateUserResolver
).pipe(Effect.withRequestCaching(true));