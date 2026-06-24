import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminCampaignsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={180}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            columnCount={7}
            columnWidths={[150, 120, 250, 250, 200, 120, 150]}
        />
    );
}