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
            columns={[
                { width: 40, type: 'checkbox' },      // Checkbox column
                { width: 170, type: 'text' },          // Thời gian
                { width: 250, type: 'twoLine' },       // Người thực hiện (tên + email)
                { width: 220, type: 'text' },          // Hành động
                { width: 140, type: 'text' },          // Loại Data
                { width: 200, type: 'text' },          // Data ID
                { width: 140, type: 'badge' },         // Trạng thái (badge)
                { width: 150, type: 'text' },          // IP
                { width: 180, type: 'icon' },          // Chi tiết (icon button)
            ]}
        />
    );
}