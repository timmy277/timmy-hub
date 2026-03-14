'use client';

import { useMemo } from 'react';
import {
    Checkbox,
    Group,
    Stack,
    Text,
    Paper,
    SimpleGrid,
    Accordion,
    ThemeIcon,
    rem,
} from '@mantine/core';
import { Icon } from '@iconify/react';
import { Permission } from '@/types/rbac';

interface PermissionGridProps {
    permissions: Permission[];
    value: string[];
    onChange: (value: string[]) => void;
}

export function PermissionGrid({ permissions, value, onChange }: PermissionGridProps) {
    // Group permissions by module
    const groupedPermissions = useMemo(() => {
        const groups: Record<string, Permission[]> = {};
        permissions.forEach(p => {
            if (!groups[p.module]) {
                groups[p.module] = [];
            }
            groups[p.module].push(p);
        });
        return groups;
    }, [permissions]);

    const handleToggleModule = (module: string, checked: boolean) => {
        const modulePermissionNames = groupedPermissions[module].map(p => p.name);
        if (checked) {
            // Add all module permissions to selection
            onChange([...new Set([...value, ...modulePermissionNames])]);
        } else {
            // Remove all module permissions from selection
            onChange(value.filter(name => !modulePermissionNames.includes(name)));
        }
    };

    const handleTogglePermission = (permissionName: string, checked: boolean) => {
        if (checked) {
            onChange([...value, permissionName]);
        } else {
            onChange(value.filter(name => name !== permissionName));
        }
    };

    const modules = Object.keys(groupedPermissions).sort();

    return (
        <Stack gap="md">
            <Group justify="space-between">
                <Text fw={700} size="lg">
                    Quyền hạn chi tiết
                </Text>
                <Text size="xs" c="dimmed">
                    Đã chọn {value.length} quyền
                </Text>
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="md">
                {modules.map(module => {
                    const modulePermissions = groupedPermissions[module];
                    const selectedInModule = modulePermissions.filter(p => value.includes(p.name));
                    const allSelected = selectedInModule.length === modulePermissions.length;
                    const someSelected = selectedInModule.length > 0 && !allSelected;

                    return (
                        <Accordion variant="separated" radius="md" key={module}>
                            <Accordion.Item value={module}>
                                <Accordion.Control
                                    icon={
                                        <ThemeIcon variant="light" size="sm" radius="md">
                                            <Icon icon="tabler:settings" width={rem(14)} />
                                        </ThemeIcon>
                                    }
                                >
                                    <Group
                                        justify="space-between"
                                        wrap="nowrap"
                                        style={{ width: '100%', paddingRight: rem(10) }}
                                    >
                                        <Stack gap={0}>
                                            <Text fw={600} size="sm" truncate>
                                                {module}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {selectedInModule.length}/{modulePermissions.length}{' '}
                                                selected
                                            </Text>
                                        </Stack>
                                        <Checkbox
                                            checked={allSelected}
                                            indeterminate={someSelected}
                                            onChange={event =>
                                                handleToggleModule(
                                                    module,
                                                    event.currentTarget.checked,
                                                )
                                            }
                                            onClick={e => e.stopPropagation()}
                                            size="xs"
                                        />
                                    </Group>
                                </Accordion.Control>
                                <Accordion.Panel>
                                    <Paper
                                        withBorder
                                        p="xs"
                                        radius="md"
                                        bg="var(--mantine-color-gray-0)"
                                    >
                                        <Stack gap="xs">
                                            {modulePermissions.map(permission => (
                                                <Checkbox
                                                    key={permission.name}
                                                    label={
                                                        permission.displayName || permission.action
                                                    }
                                                    description={permission.description}
                                                    checked={value.includes(permission.name)}
                                                    onChange={event =>
                                                        handleTogglePermission(
                                                            permission.name,
                                                            event.currentTarget.checked,
                                                        )
                                                    }
                                                    styles={{
                                                        body: { alignItems: 'flex-start' },
                                                        label: {
                                                            fontWeight: 500,
                                                            fontSize: rem(13),
                                                        },
                                                        description: { fontSize: rem(10) },
                                                    }}
                                                />
                                            ))}
                                        </Stack>
                                    </Paper>
                                </Accordion.Panel>
                            </Accordion.Item>
                        </Accordion>
                    );
                })}
            </SimpleGrid>
        </Stack>
    );
}
