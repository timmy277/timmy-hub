'use client';

import { useTranslation } from 'react-i18next';
import {
    Badge,
    Group,
    Text,
    Avatar,
    Stack,
    Paper,
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

export function UserDetail({ user }: UserDetailProps) {
    const { t } = useTranslation();

    const renderInfoRow = (label: string, value: string | React.ReactNode, fullWidth = false) => (
        <Group wrap="nowrap" style={fullWidth ? { gridColumn: '1 / -1' } : undefined}>
            <Text fw={500} w={140} style={{ flexShrink: 0 }}>
                {label}:
            </Text>
            <Box style={{ wordBreak: 'break-word' }}>{value}</Box>
        </Group>
    );

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
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

                            {renderInfoRow(
                                t('userManagement.fullName'),
                                `${user.profile?.firstName || ''} ${user.profile?.lastName || ''}`.trim() ||
                                    t('table.columns.notUpdated'),
                            )}

                            {renderInfoRow(t('userManagement.email'), user.email)}

                            {renderInfoRow(
                                t('userManagement.role'),
                                <Badge color="blue" variant="light">
                                    {t(`roles.${user.role}`)}
                                </Badge>,
                            )}

                            {renderInfoRow(t('userManagement.phone'), user.phone || 'N/A')}

                            {renderInfoRow(
                                t('table.columns.memberSince'),
                                formatDate(user.createdAt),
                            )}
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
        </Paper>
    );
}
