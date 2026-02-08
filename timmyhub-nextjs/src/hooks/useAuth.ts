import { LoginInput } from '@/types/auth';
import { useAuthStore } from '@/stores/useAuthStore';
import { authService } from '@/services/auth.service';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery } from '@tanstack/react-query';

export const useAuth = () => {
    const { user, isAuthenticated, clearAuthData, setAuthData } = useAuthStore();
    const router = useRouter();

    // Query to get current profile (WhoAmI)
    const { data: profileData, isLoading: isProfileLoading, refetch: refetchProfile } = useQuery({
        queryKey: ['profile'],
        queryFn: () => authService.getProfile(),
        enabled: isAuthenticated,
        retry: false,
    });

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
        }
    });

    const handleLocalLogout = () => {
        clearAuthData();
        Cookies.remove('user_role');
        Cookies.remove('user_permissions');
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
