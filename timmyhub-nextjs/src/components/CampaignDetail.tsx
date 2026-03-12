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
    ThemeIcon,
    Table,
} from '@mantine/core';
import { IconInfoCircle, IconSettings, IconCalendar, IconDiscount, IconTicket } from '@tabler/icons-react';
import { Campaign } from '@/services/campaign.service';
import { voucherService } from '@/services/voucher.service';
import { useQuery } from '@tanstack/react-query';
import dayjs from 'dayjs';
import { Loader, Center } from '@mantine/core';

interface CampaignDetailProps {
    campaign: Campaign;
}

export function CampaignDetail({ campaign }: CampaignDetailProps) {
    const { data: vouchersRes, isLoading: isLoadingVouchers } = useQuery({
        queryKey: ['vouchers-by-campaign', campaign.id],
        queryFn: () => voucherService.getVouchersByCampaign(campaign.id),
        enabled: !!campaign.id,
    });

    const vouchers = vouchersRes?.data || [];

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

                <Divider />

                <Stack gap="md">
                    <Group gap="xs">
                        <ThemeIcon size={24} radius="xl" color="teal" variant="light">
                            <IconTicket size={14} />
                        </ThemeIcon>
                        <Text fw={500}>Vouchers trong chương trình</Text>
                        <Badge size="sm" variant="outline">{vouchers.length}</Badge>
                    </Group>
                    
                    {isLoadingVouchers ? (
                        <Center py="md">
                            <Loader size="sm" />
                        </Center>
                    ) : vouchers.length > 0 ? (
                        <Table striped highlightOnHover withTableBorder withColumnBorders>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>Mã</Table.Th>
                                    <Table.Th>Loại</Table.Th>
                                    <Table.Th>Giá trị</Table.Th>
                                    <Table.Th>Đã dùng</Table.Th>
                                    <Table.Th>Hạn sử dụng</Table.Th>
                                    <Table.Th>Trạng thái</Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {vouchers.map((voucher) => (
                                    <Table.Tr key={voucher.id}>
                                        <Table.Td>
                                            <Text fw={600} size="sm">{voucher.code}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {voucher.type === 'PERCENTAGE' ? 'Giảm %' : 
                                                 voucher.type === 'FREE_SHIPPING' ? 'Freeship' : 'Giảm tiền'}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {voucher.type === 'PERCENTAGE' 
                                                    ? `${voucher.value}%` 
                                                    : voucher.type === 'FREE_SHIPPING'
                                                        ? 'Miễn phí ship'
                                                        : `${voucher.value.toLocaleString()}đ`}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">
                                                {voucher.usedCount} {voucher.usageLimit ? `/ ${voucher.usageLimit}` : ''}
                                            </Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Text size="sm">{dayjs(voucher.endDate).format('DD/MM/YYYY')}</Text>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge size="sm" color={voucher.isActive ? 'green' : 'gray'}>
                                                {voucher.isActive ? 'Hoạt động' : 'Tắt'}
                                            </Badge>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                    ) : (
                        <Paper p="md" withBorder radius="md" bg="gray.0">
                            <Text size="sm" c="dimmed" ta="center">
                                Chưa có voucher nào trong chương trình này
                            </Text>
                        </Paper>
                    )}
                </Stack>
            </Stack>
        </Box>
    );
}
