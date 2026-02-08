import { useForm } from '@mantine/form';
import {
    TextInput,
    PasswordInput,
    Select,
    Button,
    Group,
    Stack,
    Title,
    Paper,
} from '@mantine/core';
import { CreateUserInput } from '@/types/user';
import { UserRole } from '@/types/enums';
import { useCreateUserMutation } from '@/hooks/useUsers';

interface CreateUserFormProps {
    onSuccess: () => void;
    onCancel: () => void;
}

export const CreateUserForm = ({ onSuccess, onCancel }: CreateUserFormProps) => {
    const createUserMutation = useCreateUserMutation();
    const form = useForm<CreateUserInput>({
        initialValues: {
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: UserRole.CUSTOMER,
        },

        validate: {
            email: (value) => value && /^\S+@\S+$/.test(value) ? null : 'Email không hợp lệ',
            password: (value) => value && value.length < 6 ? 'Mật khẩu phải có ít nhất 6 ký tự' : null,
            firstName: (value) => value.trim().length === 0 ? 'Vui lòng nhập họ' : null,
            lastName: (value) => value.trim().length === 0 ? 'Vui lòng nhập tên' : null,
        },
    });

    const handleSubmit = (values: CreateUserInput) => {
        createUserMutation.mutate(values, {
            onSuccess: () => {
                form.reset();
                onSuccess();
            }
        });
    };

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <Title order={3} mb="lg">Tạo người dùng mới</Title>
            <form onSubmit={form.onSubmit(handleSubmit)}>
                <Stack>
                    <Group grow>
                        <TextInput label="Họ" placeholder="Họ" withAsterisk {...form.getInputProps('firstName')} />
                        <TextInput label="Tên" placeholder="Tên" withAsterisk {...form.getInputProps('lastName')} />
                    </Group>
                    <TextInput label="Email" placeholder="Email" withAsterisk {...form.getInputProps('email')} />
                    <PasswordInput label="Mật khẩu" placeholder="Mật khẩu" withAsterisk {...form.getInputProps('password')} />
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
                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={onCancel}>Hủy</Button>
                        <Button type="submit" loading={createUserMutation.isPending}>Tạo người dùng</Button>
                    </Group>
                </Stack>
            </form>
        </Paper>
    );
};
