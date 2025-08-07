import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult, QueryKey } from '@tanstack/react-query';
import { useAuth } from '../context/UseAuth'; // assuming this exists
import { sanitizeData } from '../utils/sanitizeData';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// const API_BASE = import.meta.env.VITE_API_BASE_URL;
const API_BASE = import.meta.env.VITE_FRONTEND_URL;

type UseApiQueryOptions = {
    path: string;
    queryParams?: Record<string, unknown>;
    headers?: HeadersInit;
    enabled?: boolean;
    key?: QueryKey;
};

// --- Response Types (copied from useApiMutation for consistency) ---
type SuccessResponse<T = unknown> = {
    data?: T;
    status: 'success';
    message?: string;
};

type ErrorResponse = {
    error: string;
    status: 'error';
    message?: string;
};

type CommonProps = {
    action: string | null;
};

export type ResponseProps<T = unknown> = (SuccessResponse<T> & CommonProps) | (ErrorResponse & CommonProps);

function buildUrl(path: string, queryParams?: Record<string, unknown>): string {
    path = '/proxy' + path;
    const url = new URL(path, API_BASE);
    const params = sanitizeData(queryParams || {});
    Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
    return url.toString();
}

export function useApiQuery<TResponse = unknown>({
    path,
    queryParams,
    headers = {},
    enabled = true,
    key,
}: UseApiQueryOptions): UseQueryResult<ResponseProps<TResponse>> {
    const queryKey = key || [path, queryParams];
    const { isAuthenticated, setAuthenticated } = useAuth(); // access auth context
    const navigate = useNavigate();

    const fetchData = async (): Promise<ResponseProps<TResponse>> => {
        const url = buildUrl(path, queryParams);
        try {
            const res = await fetch(url, {
                method: 'GET',
                headers,
                credentials: 'include',
            });

            const isAuth = res.status !== 401 && res.status !== 403;

            if (isAuth && !isAuthenticated) {
                setAuthenticated(true);
            } else if (!isAuth && isAuthenticated) {
                setAuthenticated(false);
                navigate('/login');
                return Promise.reject({ error: 'Unauthorized', status: 'error', action: null, message: 'Unauthorized' });
            }
            if (res.status === 429) {
                toast.error("Too many requests. Please try again later.", {
                    duration: 4000,
                });
                return Promise.reject("Too many requests.")
            }


            const contentType = res.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            const json = isJson ? await res.json() : {};
            const action = (json && 'action' in json) ? json.action : null;

            if (!res.ok) {
                return {
                    status: 'error',
                    error: (json && 'error' in json) ? json.error : `Error ${res.status}: ${res.statusText}`,
                    message: (json && 'message' in json) ? json.message : '',
                    action,
                };
            }
            return json as ResponseProps<TResponse>
        } catch (err: unknown) {
            const errorMessage =
                !navigator.onLine
                    ? 'No internet connection'
                    : err instanceof TypeError
                        ? 'Network error'
                        : err instanceof Error
                            ? err.message
                            : 'An unknown error occurred';
            return {
                status: 'error',
                error: errorMessage,
                action: null,
                message: errorMessage,
            };
        }
    };

    return useQuery<ResponseProps<TResponse>>({
        queryKey,
        queryFn: fetchData,
        enabled,
    });
}
