import { Container, Stack, Skeleton, Paper, Box } from '@mantine/core';

interface AdminTableSkeletonProps {
    titleWidth?: number;
    showAddButton?: boolean;
    showExportButton?: boolean;
    showSearch?: boolean;
    searchWidth?: number;
    rowCount?: number;
    // Column configuration for table-like skeleton
    columns?: {
        width: number | string; // width in pixels or percentage
        type?: 'checkbox' | 'text' | 'badge' | 'twoLine' | 'icon'; // visual style
    }[];
}

export default function AdminTableSkeleton({
    titleWidth = 200,
    showAddButton = false,
    showExportButton = false,
    showSearch = true,
    searchWidth = 300,
    rowCount = 10,
    columns,
}: AdminTableSkeletonProps) {
    // Default columns if none provided (generic table)
    const defaultColumns = [
        { width: 40, type: 'checkbox' as const },
        { width: 150, type: 'text' as const },
        { width: 200, type: 'twoLine' as const },
        { width: 180, type: 'text' as const },
        { width: 120, type: 'badge' as const },
        { width: 150, type: 'text' as const },
        { width: 100, type: 'icon' as const },
    ];

    const tableColumns = columns || defaultColumns;

    return (
        <Container
            fluid
            p="md"
            style={{
                height: 'calc(100vh - 80px)',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Paper withBorder radius="md" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {/* Title - Inside Paper Top */}
                <div style={{ padding: '16px', borderBottom: '1px solid var(--mantine-color-default-border)' }}>
                    <Skeleton height={28} width={titleWidth} />
                </div>

                {/* Search Bar + Action Buttons */}
                <div
                    style={{
                        padding: '16px',
                        borderBottom: '1px solid var(--mantine-color-default-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: '1rem',
                    }}
                >
                    {showSearch && <Skeleton height={36} width={searchWidth} radius="sm" />}
                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                        {showAddButton && <Skeleton height={36} width={120} radius="md" />}
                        {showExportButton && <Skeleton height={36} width={100} radius="md" />}
                    </div>
                </div>

                {/* Table Header */}
                <div
                    style={{
                        padding: '8px 16px',
                        borderBottom: '2px solid var(--mantine-color-default-border)',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        background: 'var(--mantine-color-gray-0)',
                    }}
                >
                    {tableColumns.map((col, idx) => (
                        <Box
                            key={idx}
                            style={{
                                width: typeof col.width === 'number' ? `${col.width}px` : col.width,
                                flexShrink: 0,
                            }}
                        >
                            {col.type === 'checkbox' ? (
                                <Skeleton height={16} width={16} />
                            ) : (
                                <Skeleton height={12} width="70%" />
                            )}
                        </Box>
                    ))}
                </div>

                {/* Table Content - Rows */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                    <Stack gap={0}>
                        {Array.from({ length: rowCount }).map((_, rowIndex) => (
                            <div
                                key={rowIndex}
                                style={{
                                    borderBottom:
                                        rowIndex < rowCount - 1
                                            ? '1px solid var(--mantine-color-default-border)'
                                            : 'none',
                                    padding: '10px 16px',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                }}
                            >
                                {tableColumns.map((col, colIndex) => (
                                    <Box
                                        key={colIndex}
                                        style={{
                                            width:
                                                typeof col.width === 'number'
                                                    ? `${col.width}px`
                                                    : col.width,
                                            flexShrink: 0,
                                        }}
                                    >
                                        {col.type === 'checkbox' ? (
                                            <Skeleton height={16} width={16} />
                                        ) : col.type === 'twoLine' ? (
                                            <Stack gap={4}>
                                                <Skeleton height={14} width="80%" />
                                                <Skeleton height={12} width="60%" />
                                            </Stack>
                                        ) : col.type === 'badge' ? (
                                            <Skeleton height={22} width={70} radius="xl" />
                                        ) : col.type === 'icon' ? (
                                            <Skeleton height={28} width={28} radius="sm" />
                                        ) : (
                                            <Skeleton height={14} width="90%" />
                                        )}
                                    </Box>
                                ))}
                            </div>
                        ))}
                    </Stack>
                </div>

                {/* Pagination */}
                <div
                    style={{
                        padding: '12px 16px',
                        borderTop: '1px solid var(--mantine-color-default-border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <Skeleton height={20} width={120} />
                    <Skeleton height={32} width={280} radius="sm" />
                </div>
            </Paper>
        </Container>
    );
}
