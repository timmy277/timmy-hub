import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminVouchersLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={160}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            columnCount={8}
            columnWidths={[100, 200, 100, 100, 120, 120, 100, 150]}
        />
    );
}