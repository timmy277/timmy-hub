import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Button,
} from '@mantine/core';
import { DashboardShell } from '@/components';

// TRANG CHỦ LÀ SERVER COMPONENT
// Ưu điểm: Tốc độ tải trang cực nhanh, SEO tốt, có thể fetch data trực tiếp từ DB/Microservices
export default async function Home() {
  // Giả sử đây là một lệnh fetch data từ Server
  // const data = await db.products.findMany(); 

  return (
    <DashboardShell>
      <Container size="md" py="xl">
        <Stack gap="xl">
          <Stack gap="xs">
            {/* Những phần này được render sẵn HTML từ Server */}
            <Title order={1}>
              Chào mừng tới TimmyHub
            </Title>
            <Text size="lg" c="dimmed">
              Trang này hiện đang chạy ở chế độ SSR (Server-Side Rendering).
            </Text>
          </Stack>

          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Stack gap="md">
              <Group justify="space-between">
                <Text fw={500}>Hybrid Architecture (SSR + CSR)</Text>
                <Badge color="blue" variant="light">
                  SEO Optimized
                </Badge>
              </Group>

              <Text size="sm" c="dimmed">
                Phần nội dung này được Server Render sẵn. Google Bot có thể đọc được nội dung
                ngay lập tức mà không cần thực thi JavaScript.
              </Text>

              <Group gap="sm">
                {/* Button này là Mantine Component, vẫn hoạt động tốt khi server render */}
                <Button variant="light" color="blue">
                  Xem chi tiết
                </Button>
              </Group>
            </Stack>
          </Card>

          <Card withBorder style={{ borderStyle: 'dashed' }} py="xl">
            <Text ta="center" fw={500} c="dimmed">
              Bố cục Layout (Header/Sidebar) là CSR để giữ trạng thái cá nhân hóa.
            </Text>
          </Card>
        </Stack>
      </Container>
    </DashboardShell>
  );
}
