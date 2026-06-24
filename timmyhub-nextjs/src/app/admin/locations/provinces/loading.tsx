import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminProvincesLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={true}
            showExportButton={false}
            showSearch={true}
            searchWidth={300}
            rowCount={5}
            columnCount={5}
            columnWidths={[100, 220, 120, 100, 120]}
        />
    );
}