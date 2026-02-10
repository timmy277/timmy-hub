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

const subscribeTokenRefresh = (cb: (token: string) => void) => {
    refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
    refreshSubscribers.map(cb => cb(token));
    refreshSubscribers = [];
};

axiosClient.interceptors.request.use(
    config => {
        return config;
    },
    error => Promise.reject(error),
);

axiosClient.interceptors.response.use(
    response => {
        return response.data;
    },
    async (error: AxiosError) => {
        const originalRequest = error.config;

        if (
            error.response?.status === 401 &&
            originalRequest &&
            !originalRequest.url?.includes('/auth/login')
        ) {
            if (!isRefreshing) {
                isRefreshing = true;

                try {
                    // Gọi API refresh token. Backend sẽ tự lấy refreshToken từ cookie HttpOnly
                    // và trả về Set-Cookie cho accessToken mới.
                    await axios.post<RefreshResponse>(
                        `${axiosClient.defaults.baseURL}/auth/refresh`,
                        {},
                        { withCredentials: true },
                    );

                    isRefreshing = false;
                    onRefreshed('refreshed'); // Token mới nằm trong cookie, không cần truyền chuỗi thực tế

                    return axiosClient(originalRequest);
                } catch (refreshError) {
                    isRefreshing = false;
                    // Xóa store và redirect khi refresh thất bại
                    window.location.href = '/login';
                    return Promise.reject(refreshError);
                }
            }

            return new Promise(resolve => {
                subscribeTokenRefresh(() => {
                    resolve(axiosClient(originalRequest));
                });
            });
        }

        return Promise.reject(error);
    },
);

export default axiosClient;
