import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import type { SellerProfile } from '@prisma/client';
import { ResourceStatus, UserRole } from '@prisma/client';
import { RegisterSellerDto } from './dto/register-seller.dto';

@Injectable()
export class SellerService {
    constructor(private readonly prisma: PrismaService) {}

    /** Đăng ký seller: tạo profile với status PENDING, chưa set User.role = SELLER. Admin duyệt mới thành seller. */
    async register(userId: string, dto: RegisterSellerDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { sellerProfile: true },
        });
        if (!user) {
            throw new NotFoundException('Người dùng không tồn tại');
        }
        if (user.sellerProfile) {
            if (user.sellerProfile.status === ResourceStatus.PENDING) {
                throw new BadRequestException('Đơn đăng ký gian hàng đang chờ admin duyệt');
            }
            if (user.sellerProfile.status === ResourceStatus.APPROVED) {
                throw new BadRequestException('Bạn đã là seller');
            }
            throw new BadRequestException('Bạn đã đăng ký gian hàng rồi');
        }
        const existingSlug = await this.prisma.sellerProfile.findUnique({
            where: { shopSlug: dto.shopSlug.trim().toLowerCase() },
        });
        if (existingSlug) {
            throw new BadRequestException('Slug gian hàng đã được sử dụng');
        }
        const slug = dto.shopSlug.trim().toLowerCase();
        const profile = await this.prisma.sellerProfile.create({
            data: {
                userId,
                shopName: dto.shopName.trim(),
                shopSlug: slug,
                description: dto.description?.trim(),
                status: ResourceStatus.PENDING,
            },
        });
        return profile;
    }

    async getMyProfile(userId: string) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new NotFoundException('Bạn chưa đăng ký gian hàng');
        }
        if (profile.status !== ResourceStatus.APPROVED) {
            throw new ForbiddenException('Gian hàng chưa được duyệt. Vui lòng chờ admin xử lý.');
        }
        return profile;
    }

    async getMyProfileOrNull(userId: string): Promise<SellerProfile | null> {
        return this.prisma.sellerProfile.findUnique({
            where: { userId },
        });
    }

    /** Admin: danh sách đơn đăng ký seller đang chờ duyệt */
    async listPending() {
        return this.prisma.sellerProfile.findMany({
            where: { status: ResourceStatus.PENDING },
            include: { user: { include: { profile: true } } },
            orderBy: { createdAt: 'asc' },
        });
    }

    /** Admin: duyệt seller → set status APPROVED và User.role = SELLER */
    async approve(profileId: string) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { id: profileId },
        });
        if (!profile) {
            throw new NotFoundException('Không tìm thấy đơn đăng ký');
        }
        if (profile.status !== ResourceStatus.PENDING) {
            throw new BadRequestException('Đơn này đã được xử lý');
        }
        await this.prisma.$transaction([
            this.prisma.sellerProfile.update({
                where: { id: profileId },
                data: { status: ResourceStatus.APPROVED },
            }),
            this.prisma.user.update({
                where: { id: profile.userId },
                data: { role: UserRole.SELLER },
            }),
        ]);
        return this.prisma.sellerProfile.findUnique({
            where: { id: profileId },
            include: { user: { include: { profile: true } } },
        });
    }

    /** Admin: từ chối đơn đăng ký seller */
    async reject(profileId: string) {
        const profile = await this.prisma.sellerProfile.findUnique({
            where: { id: profileId },
        });
        if (!profile) {
            throw new NotFoundException('Không tìm thấy đơn đăng ký');
        }
        if (profile.status !== ResourceStatus.PENDING) {
            throw new BadRequestException('Đơn này đã được xử lý');
        }
        return this.prisma.sellerProfile.update({
            where: { id: profileId },
            data: { status: ResourceStatus.REJECTED },
        });
    }
}
