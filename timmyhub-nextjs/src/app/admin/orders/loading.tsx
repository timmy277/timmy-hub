import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminOrdersLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={false}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}
