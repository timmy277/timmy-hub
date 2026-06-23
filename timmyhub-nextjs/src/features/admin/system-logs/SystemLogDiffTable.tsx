'use client';

import { Badge, Table, Text, Box, Code } from '@mantine/core';
import type { DiffItem } from '@/services/system-logs.service';

interface SystemLogDiffTableProps {
    diffTable: DiffItem[];
}

export function SystemLogDiffTable({ diffTable }: SystemLogDiffTableProps) {
    if (!diffTable || diffTable.length === 0) {
        return (
            <Text size="sm" c="dimmed">
                Không có thay đổi
            </Text>
        );
    }

    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }

        return String(value);
    };

    const getColor = (type: DiffItem['type']) => {
        switch (type) {
            case 'added':
                return 'green';
            case 'modified':
                return 'yellow';
            case 'removed':
                return 'red';
            default:
                return 'gray';
        }
    };

    const getTypeLabel = (type: DiffItem['type']) => {
        switch (type) {
            case 'added':
                return 'Thêm mới';
            case 'modified':
                return 'Chỉnh sửa';
            case 'removed':
                return 'Xóa';
            default:
                return 'Không rõ';
        }
    };

    return (
        <Box>
            <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th w={150}>Trường dữ liệu</Table.Th>
                        <Table.Th w={100}>Loại thay đổi</Table.Th>
                        <Table.Th w="40%">Giá trị cũ</Table.Th>
                        <Table.Th w="40%">Giá trị mới</Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {diffTable.map((item, index) => {
                        const isJson =
                            typeof item.oldValue === 'object' || typeof item.newValue === 'object';

                        return (
                            <Table.Tr key={index}>
                                <Table.Td>
                                    <Text size="sm" fw={500}>
                                        {item.field}
                                    </Text>
                                </Table.Td>
                                <Table.Td>
                                    <Badge color={getColor(item.type)} size="sm">
                                        {getTypeLabel(item.type)}
                                    </Badge>
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        backgroundColor:
                                            item.type === 'removed'
                                                ? 'rgba(255, 0, 0, 0.05)'
                                                : undefined,
                                    }}
                                >
                                    {isJson && item.oldValue !== null ? (
                                        <Code block>{formatValue(item.oldValue)}</Code>
                                    ) : (
                                        <Text size="sm">{formatValue(item.oldValue)}</Text>
                                    )}
                                </Table.Td>
                                <Table.Td
                                    style={{
                                        backgroundColor:
                                            item.type === 'added'
                                                ? 'rgba(0, 255, 0, 0.05)'
                                                : item.type === 'modified'
                                                    ? 'rgba(255, 255, 0, 0.05)'
                                                    : undefined,
                                    }}
                                >
                                    {isJson && item.newValue !== null ? (
                                        <Code block>{formatValue(item.newValue)}</Code>
                                    ) : (
                                        <Text size="sm">{formatValue(item.newValue)}</Text>
                                    )}
                                </Table.Td>
                            </Table.Tr>
                        );
                    })}
                </Table.Tbody>
            </Table>
        </Box>
    );
}
