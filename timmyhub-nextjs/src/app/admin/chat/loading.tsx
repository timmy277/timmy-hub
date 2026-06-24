import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminChatLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={false}
            showExportButton={false}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            columnCount={5}
            columnWidths={[50, 150, 200, 100, 80]}
            showImageColumn={true}
            imageColumnSize={40}
        />
    );
}