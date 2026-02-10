import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacService } from '@/services/rbac.service';
import { notifications } from '@mantine/notifications';
import { Role, CreateRoleInput } from '@/types/rbac';
import { ApiErrorResponse, ApiResponse } from '@/types/api';
import { AxiosError } from 'axios';

export const useRoles = () => {
    return useQuery({
        queryKey: ['roles'],
        queryFn: () => rbacService.getAllRoles(),
    });
};

export const useRoleDetail = (id: string) => {
    return useQuery({
        queryKey: ['roles', id],
        queryFn: () => rbacService.getRoleById(id),
        enabled: !!id,
    });
};

export const useCreateRoleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Role>, AxiosError<ApiErrorResponse>, CreateRoleInput>({
        mutationFn: data => rbacService.createRole(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            notifications.show({
                title: 'Thành công',
                message: 'Tạo vai trò mới thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo vai trò',
                color: 'red',
            });
        },
    });
};

export const useDeleteRoleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, AxiosError<ApiErrorResponse>, string>({
        mutationFn: id => rbacService.deleteRole(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            notifications.show({
                title: 'Thành công',
                message: 'Xóa vai trò thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa vai trò',
                color: 'red',
            });
        },
    });
};

export const useAssignPermissionsMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<void>,
        AxiosError<ApiErrorResponse>,
        { roleId: string; permissionNames: string[] }
    >({
        mutationFn: ({ roleId, permissionNames }) =>
            rbacService.assignPermissionsToRole(roleId, permissionNames),
        onSuccess: (_, { roleId }) => {
            queryClient.invalidateQueries({ queryKey: ['roles'] });
            queryClient.invalidateQueries({ queryKey: ['roles', roleId] });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật quyền cho vai trò thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật quyền',
                color: 'red',
            });
        },
    });
};

export const usePermissions = () => {
    return useQuery({
        queryKey: ['permissions'],
        queryFn: () => rbacService.getAllPermissions(),
    });
};
