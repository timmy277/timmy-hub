import { useForm } from '@mantine/form';
import {
    TextInput,
    Select,
    Button,
    Group,
    Stack,
    Title,
    Paper,
    Switch,
} from '@mantine/core';
import { CreateUserInput } from '@/types/user';
import { UserRole } from '@/types/enums';
import { useUpdateUserMutation } from '@/hooks/useUsers';
import { User } from '@/types/auth';

interface UpdateUserFormProps {
    user: User;
    onSuccess: () => void;
    onCancel: () => void;
}

export const UpdateUserForm = ({ user, onSuccess, onCancel }: UpdateUserFormProps) => {
    const updateUserMutation = useUpdateUserMutation();
    const form = useForm<Partial<CreateUserInput>>({
        initialValues: {
            email: user.email,
            firstName: user.profile?.firstName || '',
            lastName: user.profile?.lastName || '',
            role: user.role,
            isActive: user.isActive,
            // phone is optional
            phoneNumber: user.phone || '',
        },

        validate: {
            email: (value) => value && /^\S+@\S+$/.test(value) ? null : 'Email không hợp lệ',
            firstName: (value) => value && value.trim().length === 0 ? 'Vui lòng nhập họ' : null,
            lastName: (value) => value && value.trim().length === 0 ? 'Vui lòng nhập tên' : null,
        },
    });

    const handleSubmit = (values: Partial<CreateUserInput>) => {
        updateUserMutation.mutate(
            { id: user.id, data: values },
            {
                onSuccess: () => {
                    onSuccess();
                }
            }
        );
    };

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <Title order={3} mb="lg">Cập nhật người dùng: {user.email}</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Group grow>
                        <TextInput label="Họ" placeholder="Họ" withAsterisk {...form.getInputProps('firstName')} />
                        <TextInput label="Tên" placeholder="Tên" withAsterisk {...form.getInputProps('lastName')} />
                    </Group>
                    <TextInput label="Email" placeholder="Email" withAsterisk {...form.getInputProps('email')} />
                    <TextInput label="Số điện thoại" placeholder="Số điện thoại" {...form.getInputProps('phoneNumber')} />

                    <Select
                        label="Vai trò"
                        placeholder="Chọn vai trò"
                        data={[
                            { value: UserRole.CUSTOMER, label: 'Người dùng (Customer)' },
                            { value: UserRole.SELLER, label: 'Người bán (Seller)' },
                            { value: UserRole.ADMIN, label: 'Quản trị viên (Admin)' },
                        ]}
                        allowDeselect={false}
                        withAsterisk
                        {...form.getInputProps('role')}
                    />

                    <Switch
                        label="Trạng thái hoạt động"
                        checked={form.values.isActive}
                        {...form.getInputProps('isActive', { type: 'checkbox' })}
                        color="green"
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onCancel}>Hủy</Button>
                        <Button type="submit" loading={updateUserMutation.isPending}>Cập nhật</Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
};
