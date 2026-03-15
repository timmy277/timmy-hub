'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Title,
    Text,
    Container,
    Paper,
    Stack,
    TextInput,
    Button,
    Box,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import Iconify from '@/components/iconify/Iconify';
import { sellerService } from '@/services/seller.service';

const schema = z.object({
    shopName: z.string().min(2, 'Tên gian hàng tối thiểu 2 ký tự').max(100),
    shopSlug: z
        .string()
        .min(2, 'Slug tối thiểu 2 ký tự')
        .max(60)
        .regex(
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
            'Slug chỉ được chứa chữ thường, số và dấu gạch ngang (vd: my-shop)',
        ),
    description: z.string().max(500).optional(),
});

type FormValues = z.infer<typeof schema>;

export function BecomeSellerForm() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm<FormValues>({
        initialValues: {
            shopName: '',
            shopSlug: '',
            description: '',
        },
        validate: values => {
            const result = schema.safeParse(values);
            if (result.success) return {};
            const errors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const key = issue.path[0];
                if (typeof key === 'string' && !(key in errors)) {
                    errors[key] = issue.message;
                }
            }
            return errors;
        },
    });

    const handleSubmit = async (values: FormValues) => {
        setLoading(true);
        try {
            await sellerService.register({
                shopName: values.shopName.trim(),
                shopSlug: values.shopSlug.trim().toLowerCase(),
                description: values.description?.trim() || undefined,
            });
            notifications.show({
                title: 'Thành công',
                message: 'Đăng ký gian hàng thành công. Vui lòng chờ admin duyệt.',
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            router.replace('/seller');
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : 'Có lỗi xảy ra';
            notifications.show({
                title: 'Lỗi',
                message: typeof msg === 'string' ? msg : 'Đăng ký thất bại',
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        } finally {
            setLoading(false);
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
            }}
        >
            <Container size="sm" w="100%">
                <Paper withBorder p="xl" radius="md" shadow="sm">
                    <Stack gap="lg">
                        <div>
                            <Title order={2}>Đăng ký bán hàng</Title>
                            <Text c="dimmed" size="sm" mt={4}>
                                Tạo gian hàng của bạn để bắt đầu bán sản phẩm và sử dụng voucher, chương trình khuyến mãi.
                            </Text>
                        </div>
                        <form onSubmit={form.onSubmit(handleSubmit)}>
                            <Stack gap="md">
                                <TextInput
                                    label="Tên gian hàng"
                                    placeholder="VD: Shop ABC"
                                    required
                                    {...form.getInputProps('shopName')}
                                />
                                <TextInput
                                    label="Slug gian hàng (URL)"
                                    placeholder="vd: shop-abc"
                                    description="Chỉ chữ thường, số và dấu gạch ngang. Dùng cho đường dẫn gian hàng."
                                    required
                                    {...form.getInputProps('shopSlug')}
                                />
                                <TextInput
                                    label="Mô tả (tùy chọn)"
                                    placeholder="Giới thiệu ngắn về gian hàng"
                                    {...form.getInputProps('description')}
                                />
                                <Button type="submit" loading={loading} fullWidth size="md">
                                    Đăng ký gian hàng
                                </Button>
                            </Stack>
                        </form>
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
