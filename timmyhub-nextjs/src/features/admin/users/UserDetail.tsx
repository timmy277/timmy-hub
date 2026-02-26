'use client';

import { useTranslation } from 'react-i18next';
import {
    Badge,
    Group,
    Text,
    Avatar,
    Stack,
    Title,
    Card,
    Divider,
    SimpleGrid,
    Box,
} from '@mantine/core';
import { User } from '@/types/auth';
import { formatDate } from '@/utils/date';

interface UserDetailProps {
    user: User;
}

function InfoRow({ label, value, fullWidth = false }: { label: string; value: string | React.ReactNode; fullWidth?: boolean }) {
    return (
        <Group wrap="nowrap" style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
            <Text fw={500} w={140} style={{ flexShrink: 0 }}>
                {label}:
            </Text>
            <Box style={{ wordBreak: 'break-word' }}>{value}</Box>
        </Group>
    );
}

export function UserDetail({ user }: UserDetailProps) {
    // ===== Hooks & Context =====
    const { t } = useTranslation();

    const firstName = user.profile?.firstName ?? '';
    const lastName = user.profile?.lastName ?? '';
    let fullName = `${firstName} ${lastName}`.trim();
    if (!fullName) fullName = t('table.columns.notUpdated');

    // ===== Final Render =====
    return (
        <Stack gap="lg" mt="md">
            <Stack gap="lg">
                {/* Header */}
                <Group justify="space-between" wrap="nowrap">
                    <Title order={3}>
                        {t('userManagement.userDetails', { email: user.email })}
                    </Title>
                    <Badge size="lg" color={user.isActive ? 'green' : 'red'} variant="dot">
                        {user.isActive ? t('table.status.active') : t('table.status.inactive')}
                    </Badge>
                </Group>

                <Divider />

                {/* Basic Information */}
                <Stack gap="md">
                    <Text fw={700} size="lg">
                        {t('userManagement.basicInfo')}
                    </Text>
                    <Card withBorder padding="md">
                        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                            <Group wrap="nowrap">
                                <Text fw={500} w={140} style={{ flexShrink: 0 }}>
                                    {t('userManagement.avatar')}:
                                </Text>
                                <Avatar
                                    src={user.profile?.avatar || ''}
                                    radius="xl"
                                    size="lg"
                                    color="blue"
                                >
                                    {user.profile?.firstName?.charAt(0) ||
                                        user.email.charAt(0).toUpperCase()}
                                </Avatar>
                            </Group>

                            <InfoRow
                                label={t('userManagement.fullName')}
                                value={fullName}
                            />

                            <InfoRow label={t('userManagement.email')} value={user.email} />

                            <InfoRow
                                label={t('userManagement.role')}
                                value={
                                    <Badge color="blue" variant="light">
                                        {(() => {
                                            const role = user.role as string;
                                            const translatedRole = t(`roles.${role}`);
                                            if (translatedRole !== `roles.${role}`) return translatedRole;
                                            
                                            const dynamicRole = user.userRoles?.find(ur => ur.role.name === role);
                                            return dynamicRole?.role.displayName || role;
                                        })()}
                                    </Badge>
                                }
                            />

                            <InfoRow label={t('userManagement.phone')} value={user.phone ?? 'N/A'} />

                            <InfoRow
                                label={t('table.columns.memberSince')}
                                value={formatDate(user.createdAt)}
                            />
                        </SimpleGrid>

                        {/* ID - Full Width */}
                        <Divider my="md" />
                        <Group wrap="nowrap">
                            <Text fw={500} w={140} style={{ flexShrink: 0 }}>
                                {t('userManagement.id')}:
                            </Text>
                            <Text size="xs" c="dimmed" style={{ wordBreak: 'break-all' }}>
                                {user.id}
                            </Text>
                        </Group>
                    </Card>
                </Stack>
            </Stack>
        </Stack>
    );
}
