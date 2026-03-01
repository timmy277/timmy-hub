import {
    Stack,
    Group,
    Text,
    Title,
    Paper,
    Badge,
    Divider,
    SimpleGrid,
    Box,
} from '@mantine/core';
import { IconInfoCircle, IconSettings, IconCalendar, IconDiscount } from '@tabler/icons-react';
import { Campaign } from '@/services/campaign.service';
import dayjs from 'dayjs';

interface CampaignDetailProps {
    campaign: Campaign;
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
    return (
        <Box mt="md" maw={800}>
            <Stack gap="lg">
                <Group justify="space-between">
                    <Stack gap={0}>
                        <Group>
                            <IconDiscount size={28} color="var(--mantine-color-blue-6)" />
                            <Title order={3}>{campaign.name}</Title>
                            <Badge color={campaign.isActive ? 'green' : 'gray'}>
                                {campaign.isActive ? 'Đang hoạt động' : 'Đã tắt'}
                            </Badge>
                        </Group>
                        <Text color="dimmed" size="sm" mt={4}>
                            {campaign.description || 'Không có mô tả'}
                        </Text>
                    </Stack>
                </Group>

                <Paper withBorder p="md" radius="md">
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
                        <Stack gap="xs">
                            <Group gap="xs">
                                <IconInfoCircle size={18} color="var(--mantine-color-indigo-6)" />
                                <Text fw={500}>Thông tin chung</Text>
                            </Group>
                            <Box ml={26}>
                                <Text size="sm"><Text component="span" fw={500}>Loại:</Text> {campaign.type}</Text>
                                <Text size="sm"><Text component="span" fw={500}>Trạng thái:</Text> {campaign.isActive ? 'Đang hoạt động' : 'Tạm dừng/Đã tắt'}</Text>
                            </Box>
                        </Stack>

                        <Stack gap="xs">
                            <Group gap="xs">
                                <IconSettings size={18} color="var(--mantine-color-orange-6)" />
                                <Text fw={500}>Cài đặt</Text>
                            </Group>
                            <Box ml={26}>
                                {/* Placeholder for other specific settings */}
                                <Text size="sm"><Text component="span" fw={500}>Tự động kích hoạt:</Text> {campaign.isActive ? 'Có' : 'Không'}</Text>
                            </Box>
                        </Stack>
                    </SimpleGrid>
                </Paper>

                <Divider />

                <Stack gap="xs">
                    <Group gap="xs">
                        <IconCalendar size={18} color="var(--mantine-color-teal-6)" />
                        <Text fw={500}>Thời gian áp dụng</Text>
                    </Group>
                    <Group ml={26}>
                        <Stack gap={0}>
                            <Text size="sm" color="dimmed">Ngày bắt đầu:</Text>
                            <Text size="sm" fw={500}>{dayjs(campaign.startDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Stack>
                        <Divider orientation="vertical" />
                        <Stack gap={0}>
                            <Text size="sm" color="dimmed">Ngày kết thúc:</Text>
                            <Text size="sm" fw={500}>{dayjs(campaign.endDate).format('DD/MM/YYYY HH:mm')}</Text>
                        </Stack>
                    </Group>
                </Stack>
            </Stack>
        </Box>
    );
}
