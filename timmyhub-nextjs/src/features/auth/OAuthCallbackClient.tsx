'use client';

/**
 * Client component xử lý redirect sau OAuth.
 * Sau khi BE set cookies, trang này fetch /auth/profile để lấy user data,
 * lưu vào Zustand store và cookie, rồi redirect về trang phù hợp.
 */
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Center, Loader, Stack, Text } from '@mantine/core';
import Cookies from 'js-cookie';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/stores/useAuthStore';
import { UserRole } from '@/types/auth';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';

export function OAuthCallbackClient() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setAuthData = useAuthStore(state => state.setAuthData);

    useEffect(() => {
        const success = searchParams.get('success');

        if (success !== 'true') {
            notifications.show({
                title: 'Đăng nhập thất bại',
                message: 'Không thể đăng nhập bằng tài khoản mạng xã hội.',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
            router.replace('/login');
            return;
        }

        // Cookie đã được BE set → fetch profile để lấy user data
        authService
            .getProfile()
            .then(response => {
                const user = response.data;

                // Tạo device object giả (OAuth không trả device riêng)
                const device = { id: 'oauth', name: 'OAuth Device' };

                setAuthData(user, device);

                // Lưu roles vào cookie để middleware đọc
                const roles = Array.isArray(user.roles) ? user.roles : [];
                Cookies.set('user_roles', JSON.stringify(roles), { expires: 7 });
                Cookies.set('user_permissions', JSON.stringify(user.permissions ?? []), {
                    expires: 7,
                });

                // Redirect theo role
                const target = roles.includes(UserRole.SELLER)
                    ? '/seller'
                    : roles.includes(UserRole.ADMIN) || roles.includes(UserRole.SUPER_ADMIN)
                        ? '/admin'
                        : '/';

                router.replace(target);
            })
            .catch(() => {
                notifications.show({
                    title: 'Lỗi xác thực',
                    message: 'Không thể lấy thông tin tài khoản. Vui lòng thử lại.',
                    color: 'red',
                    icon: <Iconify icon="tabler:x" width={18} />,
                });
                router.replace('/login');
            });
    }, [router, searchParams, setAuthData]);

    return (
        <Center h="100vh">
            <Stack align="center" gap="md">
                <Loader size="lg" />
                <Text c="dimmed" size="sm">
                    Đang xử lý đăng nhập...
                </Text>
            </Stack>
        </Center>
    );
}
