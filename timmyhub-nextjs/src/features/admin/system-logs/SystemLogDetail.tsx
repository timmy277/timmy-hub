'use client';

import { Box, Flex, Text, Badge, Card, Title, Divider, Grid, Code, Avatar } from '@mantine/core';
import dayjs from 'dayjs';
import type { SystemLogDetail } from '@/services/system-logs.service';
import { SystemLogDiffTable } from './SystemLogDiffTable';

interface SystemLogDetailProps {
    log: SystemLogDetail;
}

export function SystemLogDetailView({ log }: SystemLogDetailProps) {
    const formatJson = (value: unknown): string => {
        if (!value) return '-';
        try {
            return JSON.stringify(value, null, 2);
        } catch {
            return String(value);
        }
    };

    const oldValueJson = log.oldValue ? formatJson(log.oldValue) : null;
    const newValueJson = log.newValue ? formatJson(log.newValue) : null;
    const metadataJson = log.parsedMetadata ? formatJson(log.parsedMetadata) : null;

    return (
        <Flex direction="column" gap="lg" p="md">
            <Box>
                <Flex align="center" justify="space-between" mb="sm">
                    <Title order={3}>Chi tiết System Log</Title>
                    <Badge size="lg" color={log.status === 'SUCCESS' ? 'green' : 'red'}>
                        {log.status}
                    </Badge>
                </Flex>
                <Text size="sm" c="dimmed">
                    ID: {log.id}
                </Text>
            </Box>

            <Divider />

            <Card withBorder shadow="sm">
                <Title order={5} mb="md">
                    Thông tin cơ bản
                </Title>
                <Grid>
                    <Grid.Col span={6}>
                        <Flex direction="column" gap="xs">
                            <Text size="sm" fw={600}>
                                Hành động:
                            </Text>
                            <Badge variant="light" size="lg">
                                {log.action}
                            </Badge>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Flex direction="column" gap="xs">
                            <Text size="sm" fw={600}>
                                Thời gian:
                            </Text>
                            <Text size="sm">
                                {dayjs(log.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                            </Text>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Flex direction="column" gap="xs">
                            <Text size="sm" fw={600}>
                                Loại dữ liệu:
                            </Text>
                            <Text size="sm">{log.entityType || '-'}</Text>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span={6}>
                        <Flex direction="column" gap="xs">
                            <Text size="sm" fw={600}>
                                ID dữ liệu:
                            </Text>
                            <Code>{log.entityId || '-'}</Code>
                        </Flex>
                    </Grid.Col>
                </Grid>
            </Card>

            <Card withBorder shadow="sm">
                <Title order={5} mb="md">
                    Người thực hiện
                </Title>
                {log.user ? (
                    <Flex gap="md" align="center">
                        <Avatar
                            src={log.user.profile?.avatar}
                            alt={`${log.user.profile?.firstName} ${log.user.profile?.lastName}`}
                            radius="xl"
                            size="lg">
                            {log.user.profile?.firstName?.[0]}
                            {log.user.profile?.lastName?.[0]}
                        </Avatar>
                        <Flex direction="column">
                            <Text fw={500}>
                                {log.user.profile?.lastName} {log.user.profile?.firstName}
                            </Text>
                            <Text size="sm" c="dimmed">
                                {log.user.email}
                            </Text>
                            <Text size="xs" c="dimmed">
                                ID: {log.user.id}
                            </Text>
                        </Flex>
                    </Flex>
                ) : (
                    <Text size="sm" c="dimmed">
                        Hệ thống
                    </Text>
                )}
            </Card>

            <Card withBorder shadow="sm">
                <Title order={5} mb="md">
                    Thông tin mạng
                </Title>
                <Grid>
                    <Grid.Col span={6}>
                        <Flex direction="column" gap="xs">
                            <Text size="sm" fw={600}>
                                IP Address:
                            </Text>
                            <Code>{log.ipAddress || '-'}</Code>
                        </Flex>
                    </Grid.Col>
                    <Grid.Col span={12}>
                        <Flex direction="column" gap="xs">
                            <Text size="sm" fw={600}>
                                User Agent:
                            </Text>
                            <Text size="xs" style={{ wordBreak: 'break-all' }}>
                                {log.userAgent || '-'}
                            </Text>
                        </Flex>
                    </Grid.Col>
                </Grid>
            </Card>

            {log.status === 'FAILED' && log.errorMessage && (
                <Card withBorder shadow="sm" style={{ borderColor: 'var(--mantine-color-red-6)' }}>
                    <Title order={5} mb="md" c="red">
                        Thông báo lỗi
                    </Title>
                    <Code block color="red">
                        {log.errorMessage}
                    </Code>
                </Card>
            )}

            <Card withBorder shadow="sm">
                <Title order={5} mb="md">
                    Thay đổi dữ liệu
                </Title>
                <SystemLogDiffTable diffTable={log.diffTable} />
            </Card>

            {(log.oldValue || log.newValue) ? (
                <Card withBorder shadow="sm">
                    <Title order={5} mb="md">
                        Dữ liệu JSON chi tiết
                    </Title>
                    <Grid>
                        {oldValueJson && (
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} mb="xs">
                                    Giá trị cũ (Old Value):
                                </Text>
                                <Code block style={{ maxHeight: '400px', overflow: 'auto' }}>
                                    {oldValueJson}
                                </Code>
                            </Grid.Col>
                        )}
                        {newValueJson && (
                            <Grid.Col span={6}>
                                <Text size="sm" fw={600} mb="xs">
                                    Giá trị mới (New Value):
                                </Text>
                                <Code block style={{ maxHeight: '400px', overflow: 'auto' }}>
                                    {newValueJson}
                                </Code>
                            </Grid.Col>
                        )}
                    </Grid>
                </Card>
            ) : null}

            {log.parsedMetadata && Object.keys(log.parsedMetadata).length > 0 && metadataJson && (
                <Card withBorder shadow="sm">
                    <Title order={5} mb="md">
                        Metadata
                    </Title>
                    <Code block style={{ maxHeight: '300px', overflow: 'auto' }}>
                        {metadataJson}
                    </Code>
                </Card>
            )}
        </Flex>
    );
}
