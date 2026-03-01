/**
 * Hằng số cho Product — status config (màu + label)
 * Dùng: import { PRODUCT_STATUS_CONFIG } from '@/constants'
 */
import { ResourceStatus } from '@/types/product';

export const PRODUCT_STATUS_CONFIG: Record<ResourceStatus, { color: string; label: string }> = {
    [ResourceStatus.PENDING]: { color: 'yellow', label: 'Chờ duyệt' },
    [ResourceStatus.APPROVED]: { color: 'green', label: 'Đã duyệt' },
    [ResourceStatus.REJECTED]: { color: 'red', label: 'Từ chối' },
    [ResourceStatus.DELETED]: { color: 'gray', label: 'Đã xóa' },
};
