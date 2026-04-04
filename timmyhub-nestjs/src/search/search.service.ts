import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from '@elastic/elasticsearch';
import type { SortCombinations } from '@elastic/elasticsearch/lib/api/types';
import { PrismaService } from '../database/prisma.service';
import { SearchProductDto, SearchSortBy } from './dto/search.dto';
import { ResourceStatus } from '@prisma/client';

const INDEX = 'products';

interface ProductDoc {
    id: string;
    name: string;
    description: string;
    slug: string;
    price: number;
    originalPrice: number | null;
    discount: number;
    stock: number;
    images: string[];
    categoryId: string | null;
    categoryName: string | null;
    brandId: string | null;
    brandName: string | null;
    sellerId: string;
    shopName: string | null;
    shopSlug: string | null;
    ratingAvg: number;
    ratingCount: number;
    soldCount: number;
    viewCount: number;
    isFeatured: boolean;
    isNew: boolean;
    tags: string[];
    createdAt: string;
}

@Injectable()
export class SearchService implements OnModuleInit {
    private readonly logger = new Logger(SearchService.name);
    private client: Client;
    private isAvailable = false;

    constructor(
        private config: ConfigService,
        private prisma: PrismaService,
    ) {
        const node = this.config.get<string>('ELASTICSEARCH_NODE', 'http://localhost:9200');
        this.client = new Client({ node });
    }

    async onModuleInit() {
        try {
            await this.client.ping();
            this.isAvailable = true;
            this.logger.log('✅ Elasticsearch connected');
            await this.ensureIndex();
        } catch {
            this.isAvailable = false;
            this.logger.warn('⚠️  Elasticsearch not available - search will fallback to DB');
        }
    }

    // ── Index management ────────────────────────────────────────────────────

    private async ensureIndex() {
        const exists = await this.client.indices.exists({ index: INDEX });
        if (!exists) {
            await this.client.indices.create({
                index: INDEX,
                mappings: {
                    properties: {
                        id: { type: 'keyword' },
                        name: {
                            type: 'text',
                            analyzer: 'standard',
                            fields: {
                                keyword: { type: 'keyword' },
                                suggest: { type: 'search_as_you_type' },
                            },
                        },
                        description: { type: 'text', analyzer: 'standard' },
                        slug: { type: 'keyword' },
                        price: { type: 'double' },
                        originalPrice: { type: 'double' },
                        discount: { type: 'integer' },
                        stock: { type: 'integer' },
                        images: { type: 'keyword', index: false },
                        categoryId: { type: 'keyword' },
                        categoryName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                        brandId: { type: 'keyword' },
                        brandName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                        sellerId: { type: 'keyword' },
                        shopName: { type: 'text', fields: { keyword: { type: 'keyword' } } },
                        shopSlug: { type: 'keyword' },
                        ratingAvg: { type: 'float' },
                        ratingCount: { type: 'integer' },
                        soldCount: { type: 'integer' },
                        viewCount: { type: 'integer' },
                        isFeatured: { type: 'boolean' },
                        isNew: { type: 'boolean' },
                        tags: { type: 'keyword' },
                        createdAt: { type: 'date' },
                    },
                },
                settings: {
                    number_of_shards: 1,
                    number_of_replicas: 0,
                },
            });
            this.logger.log(`Created index: ${INDEX}`);
        }
    }

    // ── Index a single product ───────────────────────────────────────────────

    async indexProduct(productId: string) {
        if (!this.isAvailable) return;
        const product = await this.prisma.product.findUnique({
            where: { id: productId },
            include: {
                category: true,
                sellerProfile: true,
            },
        });
        if (!product || product.status !== ResourceStatus.APPROVED) return;

        const doc: ProductDoc = {
            id: product.id,
            name: product.name,
            description: product.description ?? '',
            slug: product.slug,
            price: Number(product.price),
            originalPrice: product.originalPrice ? Number(product.originalPrice) : null,
            discount: product.discount ?? 0,
            stock: product.stock,
            images: product.images,
            categoryId: product.categoryId ?? null,
            categoryName: product.category?.name ?? null,
            brandId: product.brandId ?? null,
            brandName: null,
            sellerId: product.sellerId,
            shopName: product.sellerProfile?.shopName ?? null,
            shopSlug: product.sellerProfile?.shopSlug ?? null,
            ratingAvg: product.ratingAvg,
            ratingCount: product.ratingCount,
            soldCount: product.soldCount,
            viewCount: product.viewCount,
            isFeatured: product.isFeatured,
            isNew: product.isNew,
            tags: [],
            createdAt: product.createdAt.toISOString(),
        };

        await this.client.index({ index: INDEX, id: product.id, document: doc });
    }

    async removeProduct(productId: string) {
        if (!this.isAvailable) return;
        try {
            await this.client.delete({ index: INDEX, id: productId });
        } catch {
            /* not found is ok */
        }
    }

    // ── Bulk reindex all approved products ──────────────────────────────────

    async reindexAll(): Promise<{ indexed: number }> {
        if (!this.isAvailable) return { indexed: 0 };

        const products = await this.prisma.product.findMany({
            where: { status: ResourceStatus.APPROVED },
            include: { category: true, sellerProfile: true },
        });

        if (products.length === 0) return { indexed: 0 };

        const operations = products.flatMap(p => [
            { index: { _index: INDEX, _id: p.id } },
            {
                id: p.id,
                name: p.name,
                description: p.description ?? '',
                slug: p.slug,
                price: Number(p.price),
                originalPrice: p.originalPrice ? Number(p.originalPrice) : null,
                discount: p.discount ?? 0,
                stock: p.stock,
                images: p.images,
                categoryId: p.categoryId ?? null,
                categoryName: p.category?.name ?? null,
                brandId: p.brandId ?? null,
                brandName: null,
                sellerId: p.sellerId,
                shopName: p.sellerProfile?.shopName ?? null,
                shopSlug: p.sellerProfile?.shopSlug ?? null,
                ratingAvg: p.ratingAvg,
                ratingCount: p.ratingCount,
                soldCount: p.soldCount,
                viewCount: p.viewCount,
                isFeatured: p.isFeatured,
                isNew: p.isNew,
                tags: [],
                createdAt: p.createdAt.toISOString(),
            } as ProductDoc,
        ]);

        await this.client.bulk({ operations, refresh: true });
        this.logger.log(`Reindexed ${products.length} products`);
        return { indexed: products.length };
    }

    // ── Search ───────────────────────────────────────────────────────────────

    async search(dto: SearchProductDto) {
        if (!this.isAvailable) return this.fallbackSearch(dto);

        const {
            q,
            category,
            brand,
            minPrice,
            maxPrice,
            minRating,
            sortBy,
            page = 1,
            limit = 20,
        } = dto;
        const from = (page - 1) * limit;

        // Build query
        const must: object[] = [{ term: { stock: { value: 0, boost: 0 } } }];
        const filter: object[] = [];

        if (q?.trim()) {
            must.length = 0; // reset
            must.push({
                multi_match: {
                    query: q,
                    fields: ['name^3', 'description', 'categoryName^2', 'shopName', 'tags'],
                    type: 'best_fields',
                    fuzziness: 'AUTO',
                },
            });
        } else {
            must.length = 0;
            must.push({ match_all: {} });
        }

        // Filters
        filter.push({ range: { stock: { gt: 0 } } });
        if (category) filter.push({ term: { categoryId: category } });
        if (brand) filter.push({ term: { brandId: brand } });
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter.push({
                range: {
                    price: {
                        ...(minPrice !== undefined && { gte: minPrice }),
                        ...(maxPrice !== undefined && { lte: maxPrice }),
                    },
                },
            });
        }
        if (minRating !== undefined) filter.push({ range: { ratingAvg: { gte: minRating } } });

        // Sort
        let sort: SortCombinations[] = [];
        switch (sortBy) {
            case SearchSortBy.NEWEST:
                sort = [{ createdAt: 'desc' }];
                break;
            case SearchSortBy.PRICE_ASC:
                sort = [{ price: 'asc' }];
                break;
            case SearchSortBy.PRICE_DESC:
                sort = [{ price: 'desc' }];
                break;
            case SearchSortBy.BEST_SELLING:
                sort = [{ soldCount: 'desc' }];
                break;
            case SearchSortBy.RATING:
                sort = [{ ratingAvg: 'desc' }];
                break;
            default:
                sort = q
                    ? [{ _score: { order: 'desc' } } as SortCombinations]
                    : [{ soldCount: 'desc' } as SortCombinations];
        }

        const result = await this.client.search({
            index: INDEX,
            from,
            size: limit,
            query: { bool: { must, filter } },
            sort,
            highlight: q
                ? {
                      fields: {
                          name: {},
                          description: { fragment_size: 150, number_of_fragments: 1 },
                      },
                      pre_tags: ['<mark>'],
                      post_tags: ['</mark>'],
                  }
                : undefined,
            aggs: {
                categories: { terms: { field: 'categoryName.keyword', size: 20 } },
                priceRange: { stats: { field: 'price' } },
                avgRating: { avg: { field: 'ratingAvg' } },
            },
        });

        const hits = result.hits.hits;
        const total =
            typeof result.hits.total === 'number'
                ? result.hits.total
                : (result.hits.total?.value ?? 0);

        return {
            data: hits.map(h => ({
                ...(h._source as ProductDoc),
                _score: h._score,
                highlight: h.highlight,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                took: result.took,
            },
            aggregations: {
                categories:
                    (
                        result.aggregations?.categories as {
                            buckets: { key: string; doc_count: number }[];
                        }
                    )?.buckets ?? [],
                priceRange: result.aggregations?.priceRange,
            },
        };
    }

    // ── Suggest (autocomplete) ───────────────────────────────────────────────

    async suggest(q: string): Promise<string[]> {
        if (!this.isAvailable || !q?.trim()) return [];

        const result = await this.client.search({
            index: INDEX,
            size: 8,
            query: {
                multi_match: {
                    query: q,
                    fields: ['name.suggest', 'name^2'],
                    type: 'bool_prefix',
                },
            },
            _source: ['name'],
        });

        return result.hits.hits.map(h => (h._source as { name: string }).name);
    }

    // ── Fallback to DB when ES is down ──────────────────────────────────────

    private async fallbackSearch(dto: SearchProductDto) {
        const { q, page = 1, limit = 20 } = dto;
        const skip = (page - 1) * limit;

        const where = {
            status: ResourceStatus.APPROVED,
            stock: { gt: 0 },
            ...(q && {
                OR: [
                    { name: { contains: q, mode: 'insensitive' as const } },
                    { description: { contains: q, mode: 'insensitive' as const } },
                ],
            }),
        };

        const [products, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy: { soldCount: 'desc' },
                include: { category: true },
            }),
            this.prisma.product.count({ where }),
        ]);

        return {
            data: products,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit), took: 0 },
            aggregations: { categories: [] },
        };
    }

    get available() {
        return this.isAvailable;
    }
}
