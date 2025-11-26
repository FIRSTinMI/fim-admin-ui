import { useEffect } from 'react';
import { useSnackbar } from 'notistack';

const useNotifyMutationStatus = (mutation: any, successText?: string, errorText?: string) => {
    const { enqueueSnackbar } = useSnackbar();

    useEffect(() => {
        if (mutation.isSuccess && successText) {
            enqueueSnackbar(successText, { variant: 'success' });
        } else if (mutation.isError && errorText) {
            enqueueSnackbar(`Error: ${errorText}`, { variant: 'error' });
        }
    }, [mutation.isSuccess, mutation.isError, mutation.error, enqueueSnackbar]);

    return mutation;
};

export default useNotifyMutationStatus;