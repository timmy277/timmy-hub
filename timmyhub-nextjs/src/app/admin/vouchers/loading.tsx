import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminVouchersLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={160}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}
