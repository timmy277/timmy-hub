import { Box, Title, Text } from '@mantine/core';

export default function ProfileOrdersPage() {
    return (
        <Box>
            <Title order={3} mb="sm">Đơn hàng của tôi</Title>
            <Text c="dimmed">Xem và theo dõi đơn hàng. (Danh sách đơn hàng sẽ có ở đây.)</Text>
        </Box>
    );
}
