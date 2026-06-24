import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminUsersLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}