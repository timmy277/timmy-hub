import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminCategoriesLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={180}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            columnCount={5}
            columnWidths={[100, 200, 120, 150, 150]}
        />
    );
}