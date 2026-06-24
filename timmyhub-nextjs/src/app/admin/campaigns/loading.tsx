import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminCampaignsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={180}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}
