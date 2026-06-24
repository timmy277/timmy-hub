import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminRolesLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={true}
            showExportButton={false}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}