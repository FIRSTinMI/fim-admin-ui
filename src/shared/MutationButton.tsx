import Button from "@mui/material/button";
import { UseMutationResult } from "@tanstack/react-query";
import { PropsWithChildren } from "react";

interface MutationButtonProps<T1, T2, T3, T4> extends PropsWithChildren {
  mutation: UseMutationResult<T1, T2, T3, T4>,
  onClick: () => Promise<void>
}
export default function MutationButton<T1, T2, T3, T4>({mutation, onClick, children}: MutationButtonProps<T1, T2, T3, T4>) {
  return (
    <Button
      loading={mutation.isPending}
      onClick={onClick}
      color={mutation.isSuccess ? 'success' : 'primary'}>
      {children}
    </Button>
  );
}