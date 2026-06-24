import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminPermissionsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={180}
            showAddButton={true}
            showExportButton={false}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
            columns={[
                { width: 40, type: 'checkbox' },       // Checkbox
                { width: 150, type: 'badge' },         // Permission Name (badge)
                { width: 150, type: 'text' },          // Display Name
                { width: 120, type: 'badge' },         // Module
                { width: 120, type: 'badge' },         // Action
                { width: '1fr', type: 'text' },        // Description (flex)
                { width: 150, type: 'text' },          // Created At
            ]}
        />
    );
}