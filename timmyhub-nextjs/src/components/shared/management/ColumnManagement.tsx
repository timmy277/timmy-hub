'use client';

import { memo } from 'react';
import { Stack, Group, Checkbox, ActionIcon } from '@mantine/core';
import Iconify from '@/components/iconify/Iconify';
import { GridApi, ColDef } from 'ag-grid-community';

interface ColumnManagementProps<T> {
    columnDefs: ColDef<T>[];
    gridApi: GridApi<T> | null;
    columnPinnedState: Record<string, boolean | 'left' | 'right' | null | undefined>;
}

function ColumnManagementInner<T>({
    columnDefs,
    gridApi,
    columnPinnedState,
}: ColumnManagementProps<T>) {
    return (
        <Stack gap="xs">
            {columnDefs.map(col =>
                col.field ? (
                    <Group key={col.colId || (col.field as string)} justify="space-between">
                        <Checkbox
                            label={col.headerName}
                            defaultChecked
                            onChange={e =>
                                gridApi?.setColumnsVisible(
                                    [col.colId || (col.field as string)],
                                    e.currentTarget.checked,
                                )
                            }
                            style={{ flex: 1 }}
                        />
                        <Group gap={4}>
                            <ActionIcon
                                variant={
                                    columnPinnedState[col.colId || (col.field as string)] === 'left'
                                        ? 'filled'
                                        : 'subtle'
                                }
                                color={
                                    columnPinnedState[col.colId || (col.field as string)] === 'left'
                                        ? 'blue'
                                        : 'gray'
                                }
                                size="sm"
                                onClick={() =>
                                    gridApi?.applyColumnState({
                                        state: [
                                            {
                                                colId: col.colId || (col.field as string),
                                                pinned: 'left',
                                            },
                                        ],
                                    })
                                }
                            >
                                <Iconify icon="fluent:arrow-previous-20-filled" width={16} />
                            </ActionIcon>
                            <ActionIcon
                                variant={
                                    !columnPinnedState[col.colId || (col.field as string)]
                                        ? 'filled'
                                        : 'subtle'
                                }
                                color="gray"
                                size="sm"
                                onClick={() =>
                                    gridApi?.applyColumnState({
                                        state: [
                                            {
                                                colId: col.colId || (col.field as string),
                                                pinned: null,
                                            },
                                        ],
                                    })
                                }
                            >
                                <Iconify icon="fluent:pin-off-20-filled" width={16} />
                            </ActionIcon>
                            <ActionIcon
                                variant={
                                    columnPinnedState[col.colId || (col.field as string)] === 'right'
                                        ? 'filled'
                                        : 'subtle'
                                }
                                color={
                                    columnPinnedState[col.colId || (col.field as string)] === 'right'
                                        ? 'blue'
                                        : 'gray'
                                }
                                size="sm"
                                onClick={() =>
                                    gridApi?.applyColumnState({
                                        state: [
                                            {
                                                colId: col.colId || (col.field as string),
                                                pinned: 'right',
                                            },
                                        ],
                                    })
                                }
                            >
                                <Iconify icon="fluent:arrow-next-20-filled" width={16} />
                            </ActionIcon>
                        </Group>
                    </Group>
                ) : null,
            )}
        </Stack>
    );
}

// Using type assertion to keep it as a generic component while being memoized
export const ColumnManagement = memo(ColumnManagementInner) as typeof ColumnManagementInner;
