import AdminTableSkeleton from '../components/AdminTableSkeleton';

export default function AdminProductsLoading() {
    return (
        <AdminTableSkeleton
            titleWidth={170}
            showAddButton={true}
            showExportButton={true}
            showSearch={true}
            searchWidth={350}
            rowCount={5}
            columnCount={11}
            columnWidths={[100, 220, 150, 180, 160, 90, 90, 90, 110, 150, 150]}
            showImageColumn={true}
            imageColumnSize={50}
        />
    );
}