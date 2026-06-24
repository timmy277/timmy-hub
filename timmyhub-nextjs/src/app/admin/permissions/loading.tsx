import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminPermissionsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={180}
            showAddButton={true}
            showExportButton={false}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}