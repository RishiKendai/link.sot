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

export type ResponseProps<T = unknown> =
    | (SuccessResponse<T>)
    | (ErrorResponse)
    | (UnknownErrorResponse)

export function useApiMutation<TPayload = unknown, TResponse = unknown>(mutationKey: string[]) {
    const { isAuthenticated, setAuthenticated } = useAuth();
    const navigate = useNavigate();

    return useMutation<ResponseProps<TResponse>, unknown, RequestParams<TPayload>>({
        mutationKey,
        mutationFn: async ({ path, method, payload, headers }: RequestParams<TPayload>) => {
            const BASE_URL = import.meta.env.VITE_API_DOMAIN;
            // const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;
            const url = `${BASE_URL}/${path}`;
            // const url = `${BASE_URL}${path}`;
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

                if (response.status === 429) {
                    toast.error("Too many requests. Please try again later.", {
                        duration: 4000,
                    });
                    return Promise.reject("Too many requests.")
                }

                const contentType = response.headers.get('Content-Type') || '';
                const isJson = contentType.includes('application/json');
                const json: ResponseProps = isJson ? await response.json() : {};

                if (!response.ok) {
                    if (response.status === 404) {
                        return {
                            status: 'error' as const,
                            error: (json && 'error' in json) ? json.error : 'Something went wrong.',
                        }
                    }
                }
                return json as ResponseProps<TResponse>
            } catch (err: unknown) {
                const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

                toast.error('Something went wrong. Please try again later.', {
                    duration: 4000,
                });

                return {
                    status: 'unknown_error' as const,
                    error: errorMessage,
                };
            }
        },
    });
}
