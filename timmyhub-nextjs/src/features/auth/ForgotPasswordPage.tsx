'use client';

import { useState } from 'react';
import {
    Button,
    Text,
    Stack,
    Paper,
    Title,
    Container,
    Anchor,
    Box,
    TextInput,
    rem,
    Group,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import Iconify from '@/components/iconify/Iconify';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useForgotPasswordMutation } from '@/hooks/useAuth';

function getApiErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const apiMsg = axiosError.response?.data?.message;
    if (typeof apiMsg === 'string') return apiMsg;
    if (error instanceof Error) return error.message;
    return fallback;
}

const schema = z.object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
});

export function ForgotPasswordPage() {
    const [emailSent, setEmailSent] = useState(false);
    const forgotPasswordMutation = useForgotPasswordMutation();

    const form = useForm({
        initialValues: { email: '' },
        validate: zodResolver(schema),
    });

    const handleSubmit = async (values: z.infer<typeof schema>) => {
        try {
            await forgotPasswordMutation.mutateAsync(values.email);
            setEmailSent(true);
            notifications.show({
                title: 'Thành công',
                message: 'Hướng dẫn đặt lại mật khẩu đã được gửi đến email của bạn',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
        } catch (error: unknown) {
            notifications.show({
                title: 'Lỗi',
                message: getApiErrorMessage(error, 'Không thể gửi email'),
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    };

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
                    {!emailSent ? (
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
                                    Quên Mật Khẩu?
                                </Title>
                                <Text c="dimmed" size="sm" mt={5}>
                                    Nhập email để nhận hướng dẫn đặt lại mật khẩu
                                </Text>
                            </Box>

                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Stack gap="md">
                                    <TextInput
                                        label="Email"
                                        placeholder="your@email.com"
                                        size="md"
                                        radius="md"
                                        leftSection={<Iconify icon="tabler:at" width={16} />}
                                        {...form.getInputProps('email')}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size="lg"
                                        radius="md"
                                        mt="md"
                                        loading={forgotPasswordMutation.isPending}
                                    >
                                        Gửi link đặt lại
                                    </Button>
                                </Stack>
                            </form>

                            <Anchor href="/login" size="sm" ta="center">
                                <Group gap={4} justify="center">
                                    <Iconify icon="tabler:arrow-left" width={14} />
                                    <Text size="sm">Quay lại đăng nhập</Text>
                                </Group>
                            </Anchor>
                        </Stack>
                    ) : (
                        <Stack gap="xl">
                            <Box ta="center">
                                <Title order={2} fw={800} c="green">
                                    Kiểm Tra Email
                                </Title>
                                <Text c="dimmed" size="sm" mt="md">
                                    Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến{' '}
                                    <strong>{form.values.email}</strong>
                                </Text>
                            </Box>

                            <Text size="sm" c="dimmed" ta="center">
                                Không nhận được email? Kiểm tra thư mục spam hoặc{' '}
                                <Anchor onClick={() => setEmailSent(false)}>thử lại</Anchor>
                            </Text>

                            <Button component="a" href="/login" variant="light" fullWidth size="lg">
                                Quay lại đăng nhập
                            </Button>
                        </Stack>
                    )}
                </Paper>

                <Text mt="xl" c="dimmed" size="xs" ta="center">
                    &copy; 2026 TimmyHub. Secure Authentication.
                </Text>
            </Container>
        </Box>
    );
}
