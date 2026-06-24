import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminSellerApplicationsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={220}
            showAddButton={false}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            hasImage={false}
            actionButtonCount={2}
        />
    );
}
