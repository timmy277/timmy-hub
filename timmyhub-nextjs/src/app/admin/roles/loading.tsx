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
            columns={[
                { width: 40, type: 'checkbox' },       // Checkbox
                { width: 150, type: 'badge' },         // Role Name (badge)
                { width: 150, type: 'text' },          // Display Name
                { width: '1fr', type: 'text' },        // Description (flex)
                { width: 120, type: 'badge' },         // Permissions count
                { width: 120, type: 'badge' },         // Users count
                { width: 150, type: 'text' },          // Created At
                { width: 150, type: 'text' },          // Updated At
            ]}
        />
    );
}