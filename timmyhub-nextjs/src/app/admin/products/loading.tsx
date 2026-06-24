import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminProductsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={170}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}
