import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminOrdersLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={false}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            columnCount={7}
            columnWidths={[120, 200, 140, 120, 130, 150, 150]}
        />
    );
}