import { useEffect } from 'react';
import { LoginInput } from '@/types/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants';

export const useAuth = () => {
    const { user, isAuthenticated, clearAuthData, setAuthData } = useAuthStore();
    const router = useRouter();

    const {
        data: profileData,
        isLoading: isProfileLoading,
        refetch: refetchProfile,
    } = useQuery({
        queryKey: QUERY_KEYS.PROFILE,
        queryFn: () => authService.getProfile(),
        enabled: isAuthenticated,
        retry: false,
    });

    useEffect(() => {
        if (!profileData?.data) return;
        const device = useAuthStore.getState().device ?? { id: 'web', name: 'web', deviceId: 'web' };
        setAuthData(profileData.data, device);
    }, [profileData?.data, setAuthData]);

    // Logout mutation
    const logoutMutation = useMutation({
        mutationFn: async () => {
            // BE clears HttpOnly cookies
            return authService.logout();
        },
        onSuccess: () => {
            handleLocalLogout();
            notifications.show({
                title: 'Success',
                message: 'Logged out successfully',
                color: 'blue',
            });
        },
        onError: () => {
            // Force logout local even if API fails
            handleLocalLogout();
        },
    });

    const handleLocalLogout = () => {
        clearAuthData();

        const cookiesToRemove = ['user_role', 'user_permissions', 'access_token', 'refresh_token'];
        cookiesToRemove.forEach(key => {
            Cookies.remove(key, { path: '/' });
            // Try both with and without domain
            Cookies.remove(key, { path: '/', domain: window.location.hostname });
        });

        // Clear localStorage
        if (typeof window !== 'undefined') {
            localStorage.removeItem('auth-storage');
        }

        router.push('/login');
    };

    const logout = () => {
        logoutMutation.mutate();
    };

    return {
        user,
        isAuthenticated,
        isProfileLoading,
        profile: profileData?.data,
        logout,
        refetchProfile,
        isLoggingOut: logoutMutation.isPending,
    };
};

export const useLoginMutation = () => {
    return useMutation({
        mutationFn: (data: LoginInput) => authService.login(data),
    });
};

// Register types & mutation
export interface RegisterInput {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export const useRegisterMutation = () => {
    return useMutation({
        mutationFn: (data: RegisterInput) => authService.register(data),
    });
};

// Forgot Password mutation
export const useForgotPasswordMutation = () => {
    return useMutation({
        mutationFn: (email: string) => authService.requestPasswordReset(email),
    });
};

// Reset Password mutation
export const useResetPasswordMutation = () => {
    return useMutation({
        mutationFn: (data: { token: string; newPassword: string }) =>
            authService.resetPassword(data.token, data.newPassword),
    });
};
