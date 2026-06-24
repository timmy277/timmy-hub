import { Container, Stack, Skeleton, Paper } from '@mantine/core';

interface AdminTableSkeletonProps {
    titleWidth?: number;
    showAddButton?: boolean;
    showExportButton?: boolean;
    showSearch?: boolean;
    searchWidth?: number;
    rowCount?: number;
}

export default function AdminTableSkeleton({
    titleWidth = 200,
    showAddButton = false,
    showExportButton = false,
    showSearch = true,
    searchWidth = 300,
    rowCount = 10,
}: AdminTableSkeletonProps) {
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
                {/* Title */}
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
                        padding: '10px 16px',
                        borderBottom: '2px solid var(--mantine-color-default-border)',
                        display: 'flex',
                        gap: '1rem',
                        alignItems: 'center',
                        background: 'var(--mantine-color-gray-0)',
                    }}
                >
                    <Skeleton height={12} width={30} />
                    <Skeleton height={12} width="15%" />
                    <Skeleton height={12} width="20%" />
                    <Skeleton height={12} width="15%" />
                    <Skeleton height={12} width="12%" />
                    <Skeleton height={12} width="18%" />
                </div>

                {/* Table Rows */}
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
                                    padding: '12px 16px',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'center',
                                }}
                            >
                                {/* Simple skeleton blocks */}
                                <Skeleton height={16} width={30} />
                                <Skeleton height={16} width="15%" />
                                <Skeleton height={16} width="20%" />
                                <Skeleton height={16} width="15%" />
                                <Skeleton height={16} width="12%" />
                                <Skeleton height={16} width="18%" />
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
