import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminSystemLogsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={180}
            showAddButton={false}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}