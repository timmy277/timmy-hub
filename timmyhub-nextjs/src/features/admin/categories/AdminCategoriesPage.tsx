'use client';

import { useMemo, useState } from 'react';
import {
    Container,
    Title,
    Text,
    Stack,
    Group,
    Badge,
    ActionIcon,
    Tooltip,
    Modal,
    TextInput,
    Textarea,
    Button,
    Paper,
    Switch,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';
import { BaseDataTable } from '@/components/tables/BaseDataTable';
import {
    useCategories,
    useCreateCategoryMutation,
    useUpdateCategoryMutation,
    useDeleteCategoryMutation
} from '@/hooks/useCategories';
import { Category } from '@/types/category';
import { ColDef, ICellRendererParams } from 'ag-grid-community';

export function AdminCategoriesPage() {
    const { data: response, isLoading, refetch } = useCategories(true);
    const createMutation = useCreateCategoryMutation();
    const updateMutation = useUpdateCategoryMutation();
    const deleteMutation = useDeleteCategoryMutation();

    const [modalOpened, setModalOpened] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const form = useForm({
        initialValues: {
            name: '',
            slug: '',
            description: '',
            isActive: true,
        },
        validate: {
            name: (value) => (value.length < 2 ? 'Tên danh mục ít nhất 2 ký tự' : null),
            slug: (value) => (!value ? 'Slug không được để trống' : null),
        },
    });

    const handleOpenCreate = () => {
        setEditingCategory(null);
        form.reset();
        setModalOpened(true);
    };

    const handleOpenEdit = (category: Category) => {
        setEditingCategory(category);
        form.setValues({
            name: category.name,
            slug: category.slug,
            description: category.description || '',
            isActive: category.isActive,
        });
        setModalOpened(true);
    };

    const handleSubmit = async (values: typeof form.values) => {
        if (editingCategory) {
            await updateMutation.mutateAsync({ id: editingCategory.id, data: values });
        } else {
            await createMutation.mutateAsync(values);
        }
        setModalOpened(false);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
            deleteMutation.mutate(id);
        }
    };

    const columnDefs = useMemo<ColDef<Category>[]>(() => [
        {
            headerName: 'Tên danh mục',
            field: 'name',
            minWidth: 200,
            cellRenderer: (params: ICellRendererParams<Category>) => (params.data?.name)
        },
        {
            headerName: 'Slug',
            field: 'slug',
        },
        {
            headerName: 'Trạng thái',
            field: 'isActive',
            cellRenderer: (params: ICellRendererParams<Category>) => (
                <Badge color={params.value ? 'green' : 'gray'} variant="light" mt={8}>
                    {params.value ? 'Hoạt động' : 'Tạm khóa'}
                </Badge>
            )
        },
        {
            headerName: 'Thao tác',
            pinned: 'right',
            width: 120,
            sortable: false,
            filter: false,
            cellRenderer: (params: ICellRendererParams<Category>) => {
                if (!params.data) return null;
                const { id } = params.data;
                return (
                    <Group gap="xs" mt={4}>
                        <Tooltip label="Chỉnh sửa">
                            <ActionIcon variant="light" color="blue" onClick={() => handleOpenEdit(params.data!)}>
                                <IconEdit size={16} />
                            </ActionIcon>
                        </Tooltip>
                        <Tooltip label="Xóa">
                            <ActionIcon
                                variant="light"
                                color="red"
                                loading={deleteMutation.isPending && deleteMutation.variables === id}
                                onClick={() => handleDelete(id)}
                            >
                                <IconTrash size={16} />
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                );
            }
        }
    ], [deleteMutation.isPending]);

    return (
        <Container size="xl" py="md">
            <Stack gap="lg">
                <Group justify="space-between">
                    <div>
                        <Title order={2}>Quản lý danh mục</Title>
                        <Text size="sm" c="dimmed">Quản lý cây danh mục sản phẩm của TimmyHub</Text>
                    </div>
                    <Group>
                        <Button
                            leftSection={<IconRefresh size={16} />}
                            variant="subtle"
                            onClick={() => refetch()}
                            loading={isLoading}
                        >
                            Làm mới
                        </Button>
                        <Button
                            leftSection={<IconPlus size={16} />}
                            onClick={handleOpenCreate}
                        >
                            Thêm danh mục
                        </Button>
                    </Group>
                </Group>

                <Paper withBorder shadow="sm" radius="md">
                    <BaseDataTable
                        rowData={response?.data || []}
                        columnDefs={columnDefs}
                        isLoading={isLoading}
                        height={500}
                    />
                </Paper>
            </Stack>

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title={editingCategory ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}
                centered
            >
                <form onSubmit={form.onSubmit(handleSubmit)}>
                    <Stack gap="md">
                        <TextInput
                            label="Tên danh mục"
                            placeholder="VD: Điện thoại & Máy tính bảng"
                            required
                            {...form.getInputProps('name')}
                        />
                        <TextInput
                            label="Slug"
                            placeholder="VD: dien-thoai-may-tinh-bang"
                            required
                            {...form.getInputProps('slug')}
                        />
                        <Textarea
                            label="Mô tả"
                            placeholder="Mô tả ngắn về danh mục..."
                            {...form.getInputProps('description')}
                        />
                        <Switch
                            label="Kích hoạt danh mục"
                            {...form.getInputProps('isActive', { type: 'checkbox' })}
                        />
                        <Group justify="flex-end" mt="md">
                            <Button variant="outline" onClick={() => setModalOpened(false)}>Hủy</Button>
                            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
                                {editingCategory ? 'Lưu thay đổi' : 'Thêm mới'}
                            </Button>
                        </Group>
                    </Stack>
                </form>
            </Modal>
        </Container>
    );
}
