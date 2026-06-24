import { Container, SimpleGrid, Skeleton } from '@mantine/core';

export default function WishlistLoading() {
    return (
        <Container size="xl" py="xl">
            <Skeleton h={40} w={200} mb="xl" />

            <SimpleGrid cols={{ base: 2, sm: 3, md: 4 }} spacing="md">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} h={280} />
                ))}
            </SimpleGrid>
        </Container>
    );
}
