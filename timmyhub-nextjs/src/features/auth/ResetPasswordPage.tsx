'use client';

import { useRouter } from 'next/navigation';
import {
    Button,
    Text,
    Stack,
    Paper,
    Title,
    Container,
    Box,
    PasswordInput,
    rem,
    Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import Iconify from '@/components/iconify/Iconify';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useResetPasswordMutation } from '@/hooks/useAuth';

function getApiErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const apiMsg = axiosError.response?.data?.message;
    if (typeof apiMsg === 'string') return apiMsg;
    if (error instanceof Error) return error.message;
    return fallback;
}

const schema = z
    .object({
        password: z
            .string()
            .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
            .regex(/[0-9]/, 'Mật khẩu phải bao gồm ít nhất một số')
            .regex(/[a-z]/, 'Mật khẩu phải bao gồm ít nhất một chữ thường')
            .regex(/[A-Z]/, 'Mật khẩu phải bao gồm ít nhất một chữ hoa')
            .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, 'Mật khẩu phải bao gồm ít nhất một ký tự đặc biệt'),
        confirmPassword: z.string(),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword'],
    });

interface ResetPasswordPageProps {
    token?: string;
}

export function ResetPasswordPage({ token }: ResetPasswordPageProps) {
    const router = useRouter();
    const resetPasswordMutation = useResetPasswordMutation();

    const form = useForm({
        initialValues: {
            password: '',
            confirmPassword: '',
        },
        validate: zodResolver(schema),
    });

    const handleSubmit = async (values: z.infer<typeof schema>) => {
        if (!token) {
            notifications.show({
                title: 'Lỗi',
                message: 'Token không hợp lệ hoặc đã hết hạn',
                color: 'red',
            });
            return;
        }

        try {
            await resetPasswordMutation.mutateAsync({
                token,
                newPassword: values.password,
            });

            notifications.show({
                title: 'Thành công',
                message: 'Mật khẩu đã được đặt lại. Bạn có thể đăng nhập ngay.',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });

            router.push('/login');
        } catch (error: unknown) {
            notifications.show({
                title: 'Lỗi',
                message: getApiErrorMessage(error, 'Không thể đặt lại mật khẩu'),
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    };

    if (!token) {
        return (
            <Box
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <Container size={420}>
                    <Paper radius="md" p={40} withBorder>
                        <Text ta="center" c="red" size="lg" fw={600}>
                            Token không hợp lệ hoặc đã hết hạn
                        </Text>
                        <Button component="a" href="/forgot-password" fullWidth mt="xl">
                            Yêu cầu link mới
                        </Button>
                    </Paper>
                </Container>
            </Box>
        );
    }

    return (
        <Box
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--mantine-spacing-md)',
                backgroundColor: 'var(--mantine-color-body)',
            }}
        >
            <Container size={420} w="100%">
                <Paper
                    radius="md"
                    p={{ base: 'lg', sm: 40 }}
                    withBorder
                    style={{
                        boxShadow: 'var(--mantine-shadow-xl)',
                        borderColor: 'var(--mantine-color-default-border)',
                        borderTop: `${rem(6)} solid var(--mantine-color-blue-6)`,
                    }}
                >
                    <Stack gap="xl">
                        <Box ta="center">
                            <Group justify="center" mb="md">
                                <Box
                                    style={{
                                        width: rem(48),
                                        height: rem(48),
                                        borderRadius: 'var(--mantine-radius-md)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        fontSize: rem(24),
                                        background:
                                            'linear-gradient(135deg, var(--mantine-color-blue-6), var(--mantine-color-cyan-5))',
                                    }}
                                >
                                    T
                                </Box>
                            </Group>
                            <Title order={2} fw={800}>
                                Đặt Lại Mật Khẩu
                            </Title>
                            <Text c="dimmed" size="sm" mt={5}>
                                Nhập mật khẩu mới của bạn
                            </Text>
                        </Box>

                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">
                                <PasswordInput
                                    label="Mật khẩu mới"
                                    placeholder="Nhập mật khẩu mới"
                                    size="md"
                                    radius="md"
                                    leftSection={<Iconify icon="tabler:lock" width={16} />}
                                    {...form.getInputProps('password')}
                                />

                                <PasswordInput
                                    label="Xác nhận mật khẩu"
                                    placeholder="Nhập lại mật khẩu"
                                    size="md"
                                    radius="md"
                                    leftSection={<Iconify icon="tabler:lock" width={16} />}
                                    {...form.getInputProps('confirmPassword')}
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    size="lg"
                                    radius="md"
                                    mt="md"
                                    loading={resetPasswordMutation.isPending}
                                >
                                    Đặt lại mật khẩu
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Paper>

                <Text mt="xl" c="dimmed" size="xs" ta="center">
                    &copy; 2026 TimmyHub. Secure Authentication.
                </Text>
            </Container>
        </Box>
    );
}
