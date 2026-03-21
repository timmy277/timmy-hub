/**
 * Form đăng ký gian hàng (seller) — dùng trong Modal hoặc trang độc lập.
 */
'use client';

import { useMemo, useState, type ReactElement } from 'react';
import { useRouter } from 'next/navigation';
import { Stack, TextInput, Button, Text, Alert } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zodResolver } from 'mantine-form-zod-resolver';
import { z } from 'zod';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import Iconify from '@/components/iconify/Iconify';
import { sellerService } from '@/services/seller.service';
import { useAuth } from '@/hooks/useAuth';
import { BECOME_SELLER_PATH } from '@/constants/become-seller';

export interface BecomeSellerRegisterFormProps {
    onSuccess?: () => void;
}

export function BecomeSellerRegisterForm({ onSuccess }: BecomeSellerRegisterFormProps): ReactElement {
    const { t } = useTranslation('common');
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);

    const schema = useMemo(
        () =>
            z.object({
                shopName: z
                    .string()
                    .min(2, t('sellerRegister.validation.shopNameMin'))
                    .max(100, t('sellerRegister.validation.shopNameMax')),
                shopSlug: z
                    .string()
                    .min(2, t('sellerRegister.validation.slugMin'))
                    .max(60)
                    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t('sellerRegister.validation.slugPattern')),
                description: z.string().max(500).optional(),
            }),
        [t],
    );

    type FormValues = z.infer<typeof schema>;

    const form = useForm<FormValues>({
        initialValues: {
            shopName: '',
            shopSlug: '',
            description: '',
        },
        validate: zodResolver(schema),
    });

    const handleSubmit = async (values: FormValues): Promise<void> => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(BECOME_SELLER_PATH)}`);
            return;
        }
        setLoading(true);
        try {
            await sellerService.register({
                shopName: values.shopName.trim(),
                shopSlug: values.shopSlug.trim().toLowerCase(),
                description: values.description?.trim() || undefined,
            });
            notifications.show({
                title: t('common.success'),
                message: t('sellerRegister.successMessage'),
                color: 'green',
                icon: <Iconify icon="tabler:check" width={18} />,
            });
            onSuccess?.();
            router.replace('/seller');
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'response' in err
                    ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
                    : undefined;
            notifications.show({
                title: t('common.error'),
                message: typeof msg === 'string' ? msg : t('sellerRegister.errorGeneric'),
                color: 'red',
                icon: <Iconify icon="tabler:x" width={18} />,
            });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <Stack gap="md">
                <Alert color="blue" variant="light" icon={<Iconify icon="tabler:info-circle" width={20} />}>
                    {t('sellerRegister.loginHint')}
                </Alert>
                <Button component={Link} href={`/login?redirect=${encodeURIComponent(BECOME_SELLER_PATH)}`} fullWidth>
                    {t('sellerRegister.loginCta')}
                </Button>
                <Button component={Link} href="/register" variant="light" fullWidth>
                    {t('sellerRegister.registerCta')}
                </Button>
            </Stack>
        );
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
                <div>
                    <Text fw={700} size="lg">
                        {t('sellerRegister.title')}
                    </Text>
                    <Text c="dimmed" size="sm" mt={4}>
                        {t('sellerRegister.subtitle')}
                    </Text>
                </div>
                <TextInput
                    label={t('sellerRegister.shopName')}
                    placeholder={t('sellerRegister.shopNamePlaceholder')}
                    required
                    {...form.getInputProps('shopName')}
                />
                <TextInput
                    label={t('sellerRegister.shopSlug')}
                    placeholder={t('sellerRegister.shopSlugPlaceholder')}
                    description={t('sellerRegister.shopSlugDesc')}
                    required
                    {...form.getInputProps('shopSlug')}
                />
                <TextInput
                    label={t('sellerRegister.description')}
                    placeholder={t('sellerRegister.descriptionPlaceholder')}
                    {...form.getInputProps('description')}
                />
                <Button type="submit" loading={loading} fullWidth className="bg-[#238be7] font-bold" size="md">
                    {t('sellerRegister.submit')}
                </Button>
            </Stack>
        </form>
    );
}
