'use client';

import { useTranslation } from 'react-i18next';
import {
    Stack,
    Group,
    Text,
    Title,
    Paper,
    Badge,
    Divider,
    List,
    ThemeIcon,
    SimpleGrid,
    Loader,
    Center,
} from '@mantine/core';
import { IconCheck, IconShieldCheck, IconInfoCircle, IconUsers } from '@tabler/icons-react';
import { Role, Permission } from '@/types/rbac';
import { formatDate } from '@/utils/date';
import { useRoleDetail } from '@/hooks/useRbac';

interface RoleDetailProps {
    role: Role;
}

export function RoleDetail({ role: initialRole }: RoleDetailProps) {
    const { t } = useTranslation();
    const { data: response, isLoading } = useRoleDetail(initialRole.id);

    // Use fetched data if available, otherwise fallback to initial role data
    const role = response?.data || initialRole;

    const groupedPermissions =
        role.permissions?.reduce(
            (acc, p) => {
                const moduleName = p.permission.module;
                if (!acc[moduleName]) acc[moduleName] = [];
                acc[moduleName].push(p.permission);
                return acc;
            },
            {} as Record<string, Permission[]>,
        ) || {};

    if (isLoading && !response) {
        return (
            <Center py="xl">
                <Loader size="lg" />
            </Center>
        );
    }

    return (
        <Paper withBorder p="xl" radius="md" mt="md">
            <Stack>
                <Group justify="space-between">
                    <Stack gap={0}>
                        <Group>
                            <Title order={3}>{role.displayName || role.name}</Title>
                            {role.isSystem && (
                                <Badge color="red" variant="filled">
                                    {t('rbac.systemRole')}
                                </Badge>
                            )}
                        </Group>
                        <Text color="dimmed" size="sm">
                            {role.name}
                        </Text>
                    </Stack>
                </Group>

                <Divider />

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Stack gap="xs">
                        <Group gap="xs">
                            <IconInfoCircle size={18} color="var(--mantine-color-blue-6)" />
                            <Text fw={500}>{t('rbac.description')}:</Text>
                        </Group>
                        <Text ml={26}>{role.description || t('common.noDescription')}</Text>
                    </Stack>

                    <Stack gap="xs">
                        <Group gap="xs">
                            <IconUsers size={18} color="var(--mantine-color-indigo-6)" />
                            <Text fw={500}>{t('common.usersCount')}:</Text>
                        </Group>
                        <Text ml={26}>
                            {role._count?.users || 0} {t('common.users')}
                        </Text>
                    </Stack>
                </SimpleGrid>

                <SimpleGrid cols={{ base: 1, sm: 2 }}>
                    <Stack gap="xs">
                        <Text size="sm" color="dimmed">
                            {t('common.createdAt')}:
                        </Text>
                        <Text size="sm">{formatDate(role.createdAt)}</Text>
                    </Stack>
                    <Stack gap="xs">
                        <Text size="sm" color="dimmed">
                            {t('common.updatedAt')}:
                        </Text>
                        <Text size="sm">{formatDate(role.updatedAt)}</Text>
                    </Stack>
                </SimpleGrid>

                <Divider label={t('rbac.permissions')} labelPosition="center" />

                <Stack gap="md">
                    <Group>
                        <IconShieldCheck size={18} color="var(--mantine-color-green-6)" />
                        <Text fw={500}>
                            {t('rbac.assignedPermissions')} ({role._count?.permissions || 0})
                        </Text>
                    </Group>

                    <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
                        {Object.entries(groupedPermissions).map(([moduleName, perms]) => (
                            <Paper key={moduleName} withBorder p="md" radius="sm">
                                <Stack gap="xs">
                                    <Badge size="lg" radius="sm" variant="light" mb="xs">
                                        {moduleName.toUpperCase()}
                                    </Badge>
                                    <List
                                        spacing="xs"
                                        size="sm"
                                        center
                                        icon={
                                            <ThemeIcon color="teal" size={20} radius="xl">
                                                <IconCheck size={12} />
                                            </ThemeIcon>
                                        }
                                    >
                                        {perms.map(p => (
                                            <List.Item key={p.id}>
                                                <Group gap="xs">
                                                    <Text fw={500}>{p.displayName}</Text>
                                                    <Badge size="xs" variant="outline">
                                                        {p.action}
                                                    </Badge>
                                                </Group>
                                            </List.Item>
                                        ))}
                                    </List>
                                </Stack>
                            </Paper>
                        ))}
                    </SimpleGrid>

                    {Object.keys(groupedPermissions).length === 0 && (
                        <Text color="dimmed" fs="italic" ta="center" py="xl">
                            {t('rbac.noPermissionsAssigned')}
                        </Text>
                    )}
                </Stack>
            </Stack>
        </Paper>
    );
}
