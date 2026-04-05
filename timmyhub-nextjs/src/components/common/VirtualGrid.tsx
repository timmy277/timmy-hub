'use client';
'use no memo';

import { useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Box, Center, Loader, Text, SimpleGrid } from '@mantine/core';
import type { SimpleGridProps } from '@mantine/core';

interface VirtualGridProps<T> {
    items: T[];
    renderItem: (item: T, index: number) => React.ReactNode;
    /** Số cột - truyền vào SimpleGrid cols prop */
    columns?: SimpleGridProps['cols'];
    /** Khoảng cách giữa các item */
    spacing?: SimpleGridProps['spacing'];
    /** Estimated height của mỗi row (px) - dùng để tính scroll position */
    estimateRowHeight?: number;
    /** Max height của container scroll (px hoặc vh string) */
    maxHeight?: number | string;
    /** Số rows render thêm ngoài viewport */
    overscan?: number;
    /** Callback khi scroll gần cuối */
    onLoadMore?: () => void;
    /** Còn data để load không */
    hasMore?: boolean;
    /** Đang fetch thêm không */
    isLoadingMore?: boolean;
    /** Loading lần đầu */
    isLoading?: boolean;
    /** Empty state */
    emptyText?: string;
    /** Padding bottom mỗi row */
    rowGap?: number;
}

export function VirtualGrid<T>({
    items,
    renderItem,
    columns = { base: 2, sm: 3, md: 4 },
    spacing = 'md',
    estimateRowHeight = 400,
    maxHeight = '80vh',
    overscan = 2,
    onLoadMore,
    hasMore = false,
    isLoadingMore = false,
    isLoading = false,
    emptyText = 'Không có dữ liệu',
    rowGap = 16,
}: VirtualGridProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null);

    // Tính số cột thực tế (dùng giá trị md hoặc base)
    const colCount = typeof columns === 'number'
        ? columns
        : (columns as Record<string, number>).md
        ?? (columns as Record<string, number>).sm
        ?? (columns as Record<string, number>).base
        ?? 4;

    // Chia items thành rows
    const rows: T[][] = [];
    for (let i = 0; i < items.length; i += colCount) {
        rows.push(items.slice(i, i + colCount));
    }

    const totalRows = rows.length + (hasMore ? 1 : 0); // +1 cho loader row

    const rowVirtualizer = useVirtualizer({
        count: totalRows,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateRowHeight + rowGap,
        overscan,
    });

    // Trigger load more khi scroll gần cuối
    useEffect(() => {
        if (!onLoadMore || !hasMore || isLoadingMore) return;
        const virtualItems = rowVirtualizer.getVirtualItems();
        const lastItem = virtualItems[virtualItems.length - 1];
        if (!lastItem) return;
        if (lastItem.index >= rows.length - 1) {
            onLoadMore();
        }
    }, [hasMore, isLoadingMore, onLoadMore, rows.length, rowVirtualizer]);

    if (isLoading) {
        return <Center py="xl"><Loader size="md" /></Center>;
    }

    if (items.length === 0) {
        return <Center py="xl"><Text c="dimmed">{emptyText}</Text></Center>;
    }

    return (
        <Box
            ref={parentRef}
            style={{
                height: maxHeight,
                overflow: 'auto',
                contain: 'strict',
            }}
        >
            <Box style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
                {rowVirtualizer.getVirtualItems().map(virtualRow => {
                    const isLoaderRow = virtualRow.index >= rows.length;
                    const row = rows[virtualRow.index];

                    return (
                        <Box
                            key={virtualRow.key}
                            data-index={virtualRow.index}
                            ref={rowVirtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                transform: `translateY(${virtualRow.start}px)`,
                                paddingBottom: rowGap,
                            }}
                        >
                            {isLoaderRow ? (
                                <Center py="md">
                                    {isLoadingMore && <Loader size="sm" />}
                                </Center>
                            ) : (
                                <SimpleGrid cols={columns} spacing={spacing}>
                                    {row.map((item, i) => (
                                        <div key={virtualRow.index * colCount + i}>
                                            {renderItem(item, virtualRow.index * colCount + i)}
                                        </div>
                                    ))}
                                </SimpleGrid>
                            )}
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
