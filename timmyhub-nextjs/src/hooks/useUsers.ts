import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { notifications } from '@mantine/notifications';
import { CreateUserInput } from '@/types/user';
import { ApiErrorResponse, ApiResponse } from '@/types/api';
import { User } from '@/types/auth';
import { AxiosError } from 'axios';
import { QUERY_KEYS } from '@/constants';

export const useUsers = () => {
    return useQuery({
        queryKey: QUERY_KEYS.USERS,
        queryFn: () => userService.getAllUsers(),
    });
};

export const useUserDetail = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.USER(id),
        queryFn: () => userService.getUserById(id),
        enabled: !!id,
    });
};

export const useToggleUserStatusMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<User>, AxiosError<ApiErrorResponse>, string>({
        mutationFn: (id: string) => userService.toggleUserStatus(id),
        onSuccess: response => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
            notifications.show({
                title: 'Thành công',
                message: response.message,
                color: 'green',
            });
        },
        onError: error => {
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
    return useMutation<
        ApiResponse<void>,
        AxiosError<ApiErrorResponse>,
        { id: string; roleNames: string[] }
    >({
        mutationFn: ({ id, roleNames }) => userService.assignUserRoles(id, roleNames),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật vai trò người dùng thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra',
                color: 'red',
            });
        },
    });
};

export const useCreateUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<User>, AxiosError<ApiErrorResponse>, CreateUserInput>({
        mutationFn: (data: CreateUserInput) => userService.createUser(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
            notifications.show({
                title: 'Thành công',
                message: 'Tạo người dùng mới thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo người dùng',
                color: 'red',
            });
        },
    });
};

export const useUpdateUserMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<User>,
        AxiosError<ApiErrorResponse>,
        { id: string; data: Partial<CreateUserInput> }
    >({
        mutationFn: ({ id, data }) => userService.updateUser(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USERS });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật thông tin người dùng thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật',
                color: 'red',
            });
        },
    });
};
