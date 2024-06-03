import { Data } from "effect";

export type RemoteData<T> = Data.TaggedEnum<{
  // eslint-disable-next-line @typescript-eslint/ban-types
  Loading: {},
  Success: { readonly data: T },
  Failure: { readonly error: Error }
}>;

export interface RemoteDataDefinition extends Data.TaggedEnum.WithGenerics<1> {
  readonly taggedEnum: RemoteData<this["A"]>
}

export const { Loading, Success, Failure } = Data.taggedEnum<RemoteDataDefinition>();
export function isLoading<T>(d: RemoteData<T>){ return d && d["_tag"] === "Loading"; }
export function getData<T>(d: RemoteData<T>) {
  if (!d || d["_tag"] !== "Success") throw new Error("Not a success!");
  return d.data;
}