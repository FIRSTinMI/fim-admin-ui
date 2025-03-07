import { FimSupabaseClient } from "src/supabaseContext";



export type StreamItem = {
    Index: number,
    CartId: string,
    Enabled: boolean,
    RtmpKey: string,
    RtmpUrl: string
};

export type AvCartConfiguration = {
    LastSeen: string | null,
    AuthToken: string,
    AssistantVersion: string,
    StreamInfo: StreamItem[]
};

const baseUrl = `${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/av-carts`;

const makeRequest = async (client: FimSupabaseClient, method: string, path: string, body?: any): Promise<any> => {
    return fetch(`${baseUrl}${path}`, {
        method: method.toUpperCase(),
        body: body,
        headers: {
            Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
        }
    });
};

export const updateCartStreamKeys = async (client: FimSupabaseClient, cartId: string, request: StreamItem[]): Promise<null> => {
    return makeRequest(
        client,
        "PUT",
        `/${cartId}/stream-info`,
        JSON.stringify(request.map(item => ({ rtmpUrl: item.RtmpUrl, rtmpKey: item.RtmpKey, enabled: item.Enabled })))
    )
        .then(async resp => {
            if (resp.status !== 200) {
                throw new Error(await resp.text());
            }
            return null;
        });
}

export const controlCartStream = async (client: FimSupabaseClient, cartId: string, mode: "start" | "stop" | "push-keys", streamNumber?: number): Promise<null> => {
    return makeRequest(client, "PUT", `/${cartId}/stream/${mode}${typeof streamNumber !== "undefined" ? `?streamNum=${streamNumber}` : ""}`)
        .then(async resp => {
            if (resp.status !== 200) {
                throw new Error(await resp.text());
            }
            return null;
        });
}