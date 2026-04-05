import axios, { AxiosError } from 'axios';
import Cookies from 'js-cookie';

interface RefreshResponse {
    success: boolean;
    data: {
        accessToken: string;
        refreshToken: string;
    };
}

const axiosClient = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];
let failedRefreshCount = 0; // Track failed refresh attempts
const MAX_REFRESH_RETRIES = 3;

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
};

const clearAuthAndRedirect = () => {
    // Clear all auth-related cookies
    const cookiesToRemove = ['access_token', 'refresh_token', 'user_roles', 'user_permissions'];
    cookiesToRemove.forEach(key => {
        Cookies.remove(key, { path: '/' });
        Cookies.remove(key, { path: '/', domain: window.location.hostname });
    });

    // Clear localStorage (if any)
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-storage');
    }

    // Redirect to login
    window.location.href = '/login?session=expired';
};

axiosClient.interceptors.request.use(
    config => {
        return config;
    },
    error => Promise.reject(error),
);

axiosClient.interceptors.response.use(
    response => {
        // Reset failed refresh count on successful request
        failedRefreshCount = 0;
        return response.data;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // Don't retry on auth endpoints
        const skipUrls = ['/auth/login', '/auth/register', '/auth/refresh'];
        const shouldSkipRetry = skipUrls.some(url => originalRequest?.url?.includes(url));

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !shouldSkipRetry &&
            !originalRequest._retry
        ) {
            // Check if refresh token exists
            const refreshToken = Cookies.get('refresh_token');
            if (!refreshToken) {
                console.warn('[Axios] No refresh token found, redirecting to login...');
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            // Prevent infinite retry loop
            if (failedRefreshCount >= MAX_REFRESH_RETRIES) {
                console.warn('[Axios] Max refresh retries reached, logging out...');
                clearAuthAndRedirect();
                return Promise.reject(error);
            }

            if (!isRefreshing) {
                isRefreshing = true;
                originalRequest._retry = true;

                try {
                    // Gọi API refresh token. Backend sẽ tự lấy refreshToken từ cookie HttpOnly
                    // và trả về Set-Cookie cho accessToken mới.
                    await axios.post<RefreshResponse>(
                        `${axiosClient.defaults.baseURL}/auth/refresh`,
                        {},
                        { withCredentials: true },
                    );

                    // Reset counters on successful refresh
                    isRefreshing = false;
                    failedRefreshCount = 0;
                    onRefreshed('refreshed'); // Token mới nằm trong cookie

                    console.log('[Axios] ✅ Token refreshed successfully');

                    // Retry original request
                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    failedRefreshCount++;

                    console.error(
                        `[Axios] ❌ Refresh failed (${failedRefreshCount}/${MAX_REFRESH_RETRIES})`,
                        refreshError,
                    );

                    // Clear auth and redirect on refresh failure
                    clearAuthAndRedirect();
                    return Promise.reject(refreshError);
                }
            }

            // Wait for ongoing refresh to complete
            return new Promise((resolve, reject) => {
                subscribeTokenRefresh(() => {
                    resolve(axiosClient(originalRequest));
                });

                // Timeout after 10s to prevent hanging
                setTimeout(() => {
                    reject(new Error('Refresh token timeout'));
                }, 10000);
            });
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
