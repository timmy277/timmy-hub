import AdminTableSkeleton from '../../components/AdminTableSkeleton';

export default function AdminWardsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={true}
            showExportButton={false}
            showSearch={true}
            searchWidth={300}
            rowCount={9}
        />
    );
}
