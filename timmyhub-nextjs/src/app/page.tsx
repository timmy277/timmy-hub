'use client';

import dynamic from 'next/dynamic';
import {
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  AppShell,
  Button,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useSidebarStore } from '@/stores/useSidebarStore';

const Sidebar = dynamic(() => import('@/components/shared/Sidebar').then((m) => m.Sidebar), {
  ssr: false,
  loading: () => <div className="w-[280px] h-screen animate-pulse bg-gray-50 dark:bg-dark-8" />
});

const Header = dynamic(() => import('@/components/shared/Header').then((m) => m.Header), {
  ssr: false,
  loading: () => <div className="h-[70px] w-full animate-pulse bg-gray-50 dark:bg-dark-8" />
});

export default function Home() {
  const { t } = useTranslation();
  const { collapsed } = useSidebarStore();

  return (
    <AppShell
      layout="alt"
      header={{ height: 70 }}
      navbar={{
        width: collapsed ? 80 : 280,
        breakpoint: 'sm',
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>
        <Container size="md" py="xl">
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={1} suppressHydrationWarning>
                {t('common.welcome')}
              </Title>
              <Text size="lg" c="dimmed">
                Bố cục hiện tại đã sạch bóng các hàm setState trong useEffect.
              </Text>
            </Stack>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Native Mantine Card</Text>
                  <Badge color="blue" variant="light">
                    Perfect Dark Mode
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed">
                  Mọi thành phần chứa logic cá nhân hóa (Theme, Lang, Sidebar) đều được nạp động (Dynamic)
                  giúp gỡ bỏ hoàn toàn lỗi Hydration mà vẫn giữ code sạch sẽ.
                </Text>

                <Group gap="sm">
                  <Button variant="filled" hidden>Hidden</Button>
                </Group>
              </Stack>
            </Card>

            <Card withBorder style={{ borderStyle: 'dashed' }} py="xl">
              <Text ta="center" fw={500} c="dimmed">
                Sidebar và Header hiện đã được nạp phía Client.
              </Text>
            </Card>
          </Stack>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
