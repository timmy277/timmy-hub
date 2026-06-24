import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminUsersLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={150}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={9}
            columns={[
                { width: 40, type: 'checkbox' },      // Checkbox
                { width: 100, type: 'icon' },          // Avatar
                { width: 150, type: 'text' },          // Name
                { width: 200, type: 'text' },          // Email
                { width: 180, type: 'badge' },         // Role (badges)
                { width: 150, type: 'badge' },         // Status
                { width: 150, type: 'text' },          // Member Since
            ]}
        />
    );
}