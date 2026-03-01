import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { rbacService } from '@/services/rbac.service';
import { notifications } from '@mantine/notifications';
import {
    Role,
    Permission,
    CreateRoleInput,
    CreatePermissionInput,
    UpdatePermissionInput,
} from '@/types/rbac';
import { ApiErrorResponse, ApiResponse } from '@/types/api';
import { AxiosError } from 'axios';
import { QUERY_KEYS } from '@/constants';

export const useRoles = () => {
    return useQuery({
        queryKey: QUERY_KEYS.ROLES,
        queryFn: () => rbacService.getAllRoles(),
    });
};

export const useRoleDetail = (id: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.ROLE(id),
        queryFn: () => rbacService.getRoleById(id),
        enabled: !!id,
    });
};

export const useCreateRoleMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Role>, AxiosError<ApiErrorResponse>, CreateRoleInput>({
        mutationFn: data => rbacService.createRole(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
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
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLES });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ROLE(roleId) });
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
        queryKey: QUERY_KEYS.PERMISSIONS,
        queryFn: () => rbacService.getAllPermissions(),
    });
};

export const useCreatePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<Permission>, AxiosError<ApiErrorResponse>, CreatePermissionInput>(
        {
            mutationFn: data => rbacService.createPermission(data),
            onSuccess: () => {
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
                notifications.show({
                    title: 'Thành công',
                    message: 'Tạo quyền mới thành công',
                    color: 'green',
                });
            },
            onError: error => {
                notifications.show({
                    title: 'Lỗi',
                    message: error.response?.data?.message || 'Có lỗi xảy ra khi tạo quyền',
                    color: 'red',
                });
            },
        },
    );
};

export const useUpdatePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<
        ApiResponse<Permission>,
        AxiosError<ApiErrorResponse>,
        { id: string; data: UpdatePermissionInput }
    >({
        mutationFn: ({ id, data }) => rbacService.updatePermission(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
            notifications.show({
                title: 'Thành công',
                message: 'Cập nhật quyền thành công',
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

export const useDeletePermissionMutation = () => {
    const queryClient = useQueryClient();
    return useMutation<ApiResponse<void>, AxiosError<ApiErrorResponse>, string>({
        mutationFn: id => rbacService.deletePermission(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PERMISSIONS });
            notifications.show({
                title: 'Thành công',
                message: 'Xóa quyền thành công',
                color: 'green',
            });
        },
        onError: error => {
            notifications.show({
                title: 'Lỗi',
                message: error.response?.data?.message || 'Có lỗi xảy ra khi xóa quyền',
                color: 'red',
            });
        },
    });
};
