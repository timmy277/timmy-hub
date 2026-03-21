'use client';

import {
    Button,
    Text,
    Stack,
    Paper,
    Title,
    Container,
    Group,
    Anchor,
    Box,
    TextInput,
    PasswordInput,
    rem,
    Progress,
    Center,
    Checkbox,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import Iconify from '@/components/iconify/Iconify';
import { notifications } from '@mantine/notifications';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useRegisterMutation } from '@/hooks/useAuth';
import { useMounted, useMediaQuery } from '@mantine/hooks';

// Password requirements
const requirements = [
    { re: /[0-9]/, label: 'Bao gồm số' },
    { re: /[a-z]/, label: 'Bao gồm chữ thường' },
    { re: /[A-Z]/, label: 'Bao gồm chữ hoa' },
    { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: 'Bao gồm ký tự đặc biệt' },
];

function getStrength(password: string) {
    let multiplier = password.length > 5 ? 0 : 1;
    requirements.forEach(requirement => {
        if (!requirement.re.test(password)) {
            multiplier += 1;
        }
    });
    return Math.max(100 - (100 / (requirements.length + 1)) * multiplier, 0);
}

function PasswordRequirement({ meets, label, visible }: { meets: boolean; label: string; visible: boolean }) {
    if (!visible) return null;
    return (
        <Text component="div" c={meets ? 'teal' : 'red'} mt={5} size="sm">
            <Center inline>
                {meets ? <Iconify icon="tabler:check" width={14} stroke={1.5} /> : <Iconify icon="tabler:x" width={14} stroke={1.5} />}
                <Box ml={7}>{label}</Box>
            </Center>
        </Text>
    );
}

function getApiErrorMessage(error: unknown, fallback: string): string {
    const axiosError = error as { response?: { data?: { message?: string } } };
    const apiMsg = axiosError.response?.data?.message;
    if (typeof apiMsg === 'string') return apiMsg;
    if (error instanceof Error) return error.message;
    return fallback;
}

// Validation schema
const schema = z
    .object({
        firstName: z.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
        lastName: z.string().min(2, { message: 'Họ phải có ít nhất 2 ký tự' }),
        email: z.string().email({ message: 'Email không hợp lệ' }),
        password: z
            .string()
            .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự' })
            .regex(/[0-9]/, 'Mật khẩu phải bao gồm ít nhất một số')
            .regex(/[a-z]/, 'Mật khẩu phải bao gồm ít nhất một chữ thường')
            .regex(/[A-Z]/, 'Mật khẩu phải bao gồm ít nhất một chữ hoa')
            .regex(/[$&+,:;=?@#|'<>.^*()%!-]/, 'Mật khẩu phải bao gồm ít nhất một ký tự đặc biệt'),
        confirmPassword: z.string(),
        agreeToTerms: z.boolean().refine(val => val === true, {
            message: 'Bạn phải đồng ý với điều khoản sử dụng',
        }),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: 'Mật khẩu không khớp',
        path: ['confirmPassword'],
    });

type RegisterFormValues = z.infer<typeof schema>;

export function RegisterPage() {
    const mounted = useMounted();
    const isMobile = useMediaQuery('(max-width: 576px)');
    const isTablet = useMediaQuery('(min-width: 577px) and (max-width: 992px)');
    const router = useRouter();
    const registerMutation = useRegisterMutation();

    const form = useForm<RegisterFormValues>({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
            agreeToTerms: false,
        },
        validate: zodResolver(schema),
    });

    const strength = getStrength(form.values.password);

    const handleSubmit = async (values: RegisterFormValues) => {
        try {
            await registerMutation.mutateAsync({
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
            });

            notifications.show({
                title: 'Thành công',
                message: 'Tài khoản đã được tạo thành công! Vui lòng đăng nhập.',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });

            router.push('/login');
        } catch (error: unknown) {
            notifications.show({
                title: 'Lỗi',
                message: getApiErrorMessage(error, 'Không thể tạo tài khoản'),
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        }
    };

    if (!mounted) return null;

    return (
        <Box
            style={{
                minHeight: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? rem(8) : rem(16),
                backgroundColor: 'var(--mantine-color-body)',
            }}
        >
            <Container size={isMobile ? 'xs' : 600} w="100%">
                <Box
                    style={{
                        borderRadius: isMobile ? rem(24) : rem(56),
                        padding: isMobile ? rem(3) : rem(4.8),
                        background:
                            'linear-gradient(180deg, var(--mantine-primary-color-6) 10%, rgba(33, 150, 243, 0) 30%)',
                    }}
                >
                    <Paper
                        radius={isMobile ? rem(21) : rem(53)}
                        p={{ base: 'md', sm: isTablet ? 'lg' : 'xl', md: 50 }}
                        withBorder
                        style={{
                            backgroundColor: 'white',
                            borderColor: 'transparent',
                            boxShadow: 'var(--mantine-shadow-md)',
                        }}
                        className="dark:bg-dark-900!"
                    >
                        <Stack gap={isMobile ? 'md' : 'xl'}>
                            <Box ta="center">
                                <Group justify="center" mb="lg">
                                    <Box
                                        style={{
                                            width: isMobile ? rem(48) : rem(64),
                                            height: isMobile ? rem(48) : rem(64),
                                            borderRadius: 'var(--mantine-radius-md)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: isMobile ? rem(24) : rem(32),
                                            background: 'var(--mantine-primary-color-6)',
                                        }}
                                    >
                                        T
                                    </Box>
                                </Group>
                                <Title
                                    order={2}
                                    fw={500}
                                    size={isMobile ? rem(22) : rem(30)}
                                    style={{ letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}
                                >
                                    Welcome to TimmyHub
                                </Title>
                                <Text c="dimmed" size={isMobile ? 'sm' : 'lg'} mt={5}>
                                    Sign up to continue
                                </Text>
                            </Box>

                            <form onSubmit={form.onSubmit(handleSubmit)}>
                                <Stack gap="md">
                                    <Group grow gap="sm" wrap="wrap">
                                        <TextInput
                                            label="Tên"
                                            placeholder="Nhập tên"
                                            size={isMobile ? 'sm' : 'md'}
                                            radius="md"
                                            leftSection={<Iconify icon="tabler:user" width={16} />}
                                            {...form.getInputProps('firstName')}
                                        />
                                        <TextInput
                                            label="Họ"
                                            placeholder="Nhập họ"
                                            size={isMobile ? 'sm' : 'md'}
                                            radius="md"
                                            leftSection={<Iconify icon="tabler:user" width={16} />}
                                            {...form.getInputProps('lastName')}
                                        />
                                    </Group>

                                    <TextInput
                                        label="Email"
                                        placeholder="your@email.com"
                                        size={isMobile ? 'sm' : 'md'}
                                        radius="md"
                                        leftSection={<Iconify icon="tabler:at" width={16} />}
                                        {...form.getInputProps('email')}
                                    />

                                    <Box>
                                        <PasswordInput
                                            label="Mật khẩu"
                                            placeholder="Tạo mật khẩu"
                                            size={isMobile ? 'sm' : 'md'}
                                            radius="md"
                                            leftSection={<Iconify icon="tabler:lock" width={16} />}
                                            {...form.getInputProps('password')}
                                        />

                                        <Group gap={5} grow mt="xs" mb="md">
                                            {(['s0', 's1', 's2', 's3'] as const).map((barId, index) => (
                                                <Progress
                                                    key={barId}
                                                    styles={{ section: { transitionDuration: '0ms' } }}
                                                    value={
                                                        form.values.password.length > 0 && index === 0
                                                            ? 100
                                                            : strength >= ((index + 1) / 4) * 100
                                                                ? 100
                                                                : 0
                                                    }
                                                    color={
                                                        strength > 80
                                                            ? 'teal'
                                                            : strength > 50
                                                                ? 'yellow'
                                                                : 'red'
                                                    }
                                                    size={4}
                                                />
                                            ))}
                                        </Group>

                                        <PasswordRequirement
                                            label="Có ít nhất 8 ký tự"
                                            meets={form.values.password.length > 7}
                                            visible={form.values.password.length > 0}
                                        />
                                        <PasswordRequirement
                                            label="Bao gồm số"
                                            meets={/[0-9]/.test(form.values.password)}
                                            visible={form.values.password.length > 0 && /[0-9]/.test(form.values.password)}
                                        />
                                        <PasswordRequirement
                                            label="Bao gồm chữ thường"
                                            meets={/[a-z]/.test(form.values.password)}
                                            visible={form.values.password.length > 0 && /[a-z]/.test(form.values.password)}
                                        />
                                        <PasswordRequirement
                                            label="Bao gồm chữ hoa"
                                            meets={/[A-Z]/.test(form.values.password)}
                                            visible={form.values.password.length > 0 && /[A-Z]/.test(form.values.password)}
                                        />
                                        <PasswordRequirement
                                            label="Bao gồm ký tự đặc biệt"
                                            meets={/[$&+,:;=?@#|'<>.^*()%!-]/.test(form.values.password)}
                                            visible={form.values.password.length > 0 && /[$&+,:;=?@#|'<>.^*()%!-]/.test(form.values.password)}
                                        />
                                    </Box>

                                    <PasswordInput
                                        label="Xác nhận mật khẩu"
                                        placeholder="Nhập lại mật khẩu"
                                        size={isMobile ? 'sm' : 'md'}
                                        radius="md"
                                        leftSection={<Iconify icon="tabler:lock" width={16} />}
                                        error={
                                            form.values.confirmPassword.length > 0 &&
                                                form.values.password !== form.values.confirmPassword
                                                ? 'Mật khẩu không khớp'
                                                : undefined
                                        }
                                        {...form.getInputProps('confirmPassword')}
                                    />
                                    <Box mb="md" visibleFrom="sm" />

                                    <Checkbox
                                        mt="xs"
                                        size={isMobile ? 'xs' : 'sm'}
                                        label={
                                            <Text size="sm">
                                                Tôi đồng ý với{' '}
                                                <Anchor size="sm" href="/terms" target="_blank">
                                                    Điều khoản sử dụng
                                                </Anchor>{' '}
                                                và{' '}
                                                <Anchor size="sm" href="/privacy" target="_blank">
                                                    Chính sách bảo mật
                                                </Anchor>
                                            </Text>
                                        }
                                        {...form.getInputProps('agreeToTerms', { type: 'checkbox' })}
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        size={isMobile ? 'sm' : 'lg'}
                                        radius="md"
                                        mt="xl"
                                        loading={registerMutation.isPending}
                                    >
                                        Tạo tài khoản
                                    </Button>
                                </Stack>
                            </form>

                            <Text c="dimmed" size="sm" ta="center">
                                Already have an account?{' '}
                                <Anchor href="/login" size="sm" fw={700} c="blue">
                                    Sign in
                                </Anchor>
                            </Text>
                        </Stack>
                    </Paper>
                </Box>
            </Container>
        </Box>
    );
}
