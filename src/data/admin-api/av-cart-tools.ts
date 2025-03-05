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


export const updateCartStreamKeys = async (client: FimSupabaseClient, cartId: string, request: StreamItem[]): Promise<null> => {
    return fetch(`${import.meta.env.PUBLIC_ADMIN_API_URL}/api/v1/av-carts/${cartId}/stream-info`, {
        method: "PUT",
        body: JSON.stringify(request.map(item => ({ rtmpUrl: item.RtmpUrl, rtmpKey: item.RtmpKey, enabled: item.Enabled }))),
        headers: {
            Authorization: `Bearer ${(await client.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json'
        }
    }).then(async resp => {
        if (resp.status !== 200) {
            throw new Error(await resp.text());
        }
        return null;
    });
}