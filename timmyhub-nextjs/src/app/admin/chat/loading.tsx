import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminChatLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={false}
            showExportButton={false}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
        />
    );
}
