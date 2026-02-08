import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { notifications } from '@mantine/notifications';

/**
 * Hook quản lý người dùng
 * @author TimmyHub AI
 */
export const useUsers = () => {
    return useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getAllUsers(),
    });
};

export const useUserDetail = (id: string) => {
    return useQuery({
        queryKey: ['users', id],
        queryFn: () => userService.getUserById(id),
        enabled: !!id,
    });
};

export const useToggleUserStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => userService.toggleUserStatus(id),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifications.show({
                title: 'Thành công',
                message: response.message,
                color: 'green',
            });
        },
        onError: (error: any) => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra',
                color: 'red',
            });
        },
    });
};

export const useAssignUserRolesMutation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, roleNames }: { id: string; roleNames: string[] }) =>
            userService.assignUserRoles(id, roleNames),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật vai trò người dùng thành công',
                color: 'green',
            });
        },
    });
};
