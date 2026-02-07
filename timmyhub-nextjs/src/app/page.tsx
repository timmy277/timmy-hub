import { Button, Container, Title, Text, Stack, Card, Group, Badge } from "@mantine/core";

export default function Home() {
  return (
    <Container size="sm" py="xl">
      <Stack gap="xl">
        <Stack gap="xs">
          <Title order={1} className="text-blue-600 underline">
            TimmyHub Integration Test
          </Title>
          <Text size="lg" c="dimmed">
            Testing Mantine 7 components with Tailwind CSS 4 utility classes.
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
              This card is built using Mantine. The title above has a Tailwind{" "}
              <code className="bg-zinc-100 p-1 rounded text-red-500 font-bold">underline</code> and{" "}
              <code className="bg-zinc-100 p-1 rounded text-blue-600 font-bold">text-blue-600</code> class.
            </Text>

            <Group gap="sm">
              <Button variant="filled" color="blue">
                Mantine Button
              </Button>
              <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-zinc-800 transition-colors">
                Tailwind Button
              </button>
            </Group>
          </Stack>
        </Card>

        <div className="p-8 bg-zinc-100 rounded-xl border-2 border-dashed border-blue-400">
          <Text className="text-center font-mono">
            This box is styled purely with Tailwind CSS 4.
          </Text>
        </div>
      </Stack>
    </Container>
  );
}
