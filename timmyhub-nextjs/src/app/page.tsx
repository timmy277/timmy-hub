'use client';

import {
  Button,
  Container,
  Title,
  Text,
  Stack,
  Card,
  Group,
  Badge,
  Flex,
  Box,
} from '@mantine/core';
import { Sidebar, Header } from '@/components';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t } = useTranslation();

  return (
    <Flex>
      <Sidebar />
      <Box
        style={{ flex: 1, minHeight: '100vh' }}
        className="bg-zinc-50/50 dark:bg-zinc-950/50"
      >
        <Header />

        <Container size="sm" py="xl">
          <Stack gap="xl">
            <Stack gap="xs">
              <Title order={1} className="underline" suppressHydrationWarning>
                {t('common.welcome')}
              </Title>
              <Text size="lg" c="dimmed">
                Testing Mantine components with Tailwind CSS utility classes.
              </Text>
            </Stack>

            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Text fw={500}>Mantine Card Component</Text>
                  <Badge color="pink" variant="light">
                    Mantine Badge
                  </Badge>
                </Group>

                <Text size="sm" c="dimmed">
                  This card is built using Mantine. The title above has a
                  Tailwind{' '}
                  <code className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded text-red-500 font-bold">
                    underline
                  </code>
                  .
                </Text>

                <Group gap="sm">
                  <Button variant="filled">Mantine Button</Button>
                  <button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors">
                    Tailwind Button
                  </button>
                </Group>
              </Stack>
            </Card>

            <div className="p-8 bg-zinc-100 dark:bg-zinc-800 rounded-xl border-2 border-dashed border-zinc-400">
              <Text ta="center" className="font-mono">
                This box is styled purely with Tailwind CSS.
              </Text>
            </div>
          </Stack>
        </Container>
      </Box>
    </Flex>
  );
}
