// hooks/useApiMutation.ts
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuth } from '../context/UseAuth';
import { useNavigate } from 'react-router-dom';

export type HttpMethod = 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestParams<TPayload> {
    path: string;
    method: HttpMethod;
    payload?: TPayload;
    headers?: HeadersInit;
}

type SuccessResponse<T = unknown> = {
    data?: T;
    status: 'success';
    message?: string;
}

type ErrorResponse = {
    error: string;
    status: 'error';
}

type UnknownErrorResponse = {
    error: string;
    status: 'unknown_error';
}

type CommonProps = {
    action: string | null;
};

export type ResponseProps<T = unknown> =
    | (SuccessResponse<T> & CommonProps)
    | (ErrorResponse & CommonProps)
    | (UnknownErrorResponse & CommonProps)

export function useApiMutation<TPayload = unknown, TResponse = unknown>(mutationKey: string[]) {
    const { isAuthenticated, setAuthenticated } = useAuth();
    const navigate = useNavigate();

    return useMutation<ResponseProps<TResponse>, unknown, RequestParams<TPayload>>({
        mutationKey,
        mutationFn: async ({ path, method, payload, headers }: RequestParams<TPayload>) => {
            const BASE_URL = import.meta.env.VITE_FRONTEND_URL;
            // const BASE_URL = import.meta.env.VITE_API_BASE_URL;
            const url = `${BASE_URL}/proxy${path}`;
            // const url = `${BASE_URL}${path}`;
            console.log('url ', url)
            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                        ...(headers || {}),
                    },
                    body: payload ? JSON.stringify(payload) : undefined,
                    credentials: 'include', // send cookies
                });

                const isAuth = response.status !== 401 && response.status !== 403;

                if (isAuth && !isAuthenticated) {
                    setAuthenticated(true);
                } else if (!isAuth && isAuthenticated) {
                    setAuthenticated(false);
                    navigate('/login');
                    return Promise.reject({ error: 'Unauthorized' });
                }

                const contentType = response.headers.get('Content-Type') || '';
                const isJson = contentType.includes('application/json');
                const json: ResponseProps = isJson ? await response.json() : {};

                // Extract action if present (optional)
                const action = (json && 'action' in json) ? json.action : null;

                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            status: 'error' as const,
                            error: (json && 'error' in json) ? json.error : 'Something went wrong.',
                            action,
                        }
                    }
                }
                console.log('in ', json)
                return json as ResponseProps<TResponse>
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

                toast.error('Something went wrong. Please try again later.', {
                    duration: 4000,
                });

                return {
                    status: 'unknown_error' as const,
                    error: errorMessage,
                    action: null,
                };
            }
        },
    });
}
