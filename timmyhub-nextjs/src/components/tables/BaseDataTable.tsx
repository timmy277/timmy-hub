'use client';

import { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
    ModuleRegistry,
    ColDef,
    GridReadyEvent,
    themeQuartz,
    colorSchemeDark,
    ClientSideRowModelModule,
    PaginationModule,
    RowSelectionModule,
    CellStyleModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    QuickFilterModule,
    ValidationModule,
    ColumnApiModule,
    CsvExportModule
} from 'ag-grid-community';
import { useMantineColorScheme, Box } from '@mantine/core';

// Register modules
ModuleRegistry.registerModules([
    ClientSideRowModelModule,
    PaginationModule,
    RowSelectionModule,
    CellStyleModule,
    TextFilterModule,
    NumberFilterModule,
    DateFilterModule,
    QuickFilterModule,
    ValidationModule,
    ColumnApiModule,
    CsvExportModule
]);

// Helper to determine the theme based on color scheme
const getGridTheme = (colorScheme: string) => {
    if (colorScheme === 'dark') {
        return themeQuartz.withPart(colorSchemeDark);
    }
    return themeQuartz;
};

interface BaseDataTableProps<T> {
    rowData: T[];
    columnDefs: ColDef<T>[];
    onGridReady?: (event: GridReadyEvent<T>) => void;
    isLoading?: boolean;
    pagination?: boolean;
    paginationPageSize?: number;
    quickFilterText?: string;
    height?: number | string;
}

/**
 * Component bảng dữ liệu sử dụng AG Grid theo chuẩn Project Plan
 * @author TimmyHub AI
 */
export function BaseDataTable<T>({
    rowData,
    columnDefs,
    onGridReady,
    isLoading = false,
    pagination = true,
    paginationPageSize = 10,
    quickFilterText,
    height = 500
}: BaseDataTableProps<T>) {
    const { colorScheme } = useMantineColorScheme();
    const gridRef = useRef<AgGridReact<T>>(null);

    const defaultColDef = useMemo<ColDef>(() => ({
        flex: 1,
        minWidth: 100,
        filter: true,
        sortable: true,
        resizable: true,
    }), []);

    const gridTheme = useMemo(() => {
        return getGridTheme(colorScheme);
    }, [colorScheme]);

    return (
        <Box style={{ height, width: '100%', minHeight: 500 }}>
            <AgGridReact<T>
                ref={gridRef}
                theme={gridTheme}
                rowData={rowData}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                pagination={pagination}
                paginationPageSize={paginationPageSize}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                quickFilterText={quickFilterText}
                loading={isLoading}
                animateRows={true}
                rowSelection={{ mode: 'multiRow' }}
            />
        </Box>
    );
}
