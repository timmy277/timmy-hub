import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient<any, any, any>;
    private readonly logger = new Logger(SupabaseService.name);
    private readonly bucketName: string;

    constructor(private configService: ConfigService) {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');
        this.bucketName = this.configService.get<string>('SUPABASE_BUCKET') || 'timmy-hub-avatars';

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase URL or Key is missing in environment variables');
            throw new Error('Supabase configuration is missing');
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
    }

    async uploadFile(file: Express.Multer.File, folder: string = 'uploads'): Promise<string> {
        const timestamp = Date.now();
        const multerFile = file as { originalname: string; buffer: Buffer; mimetype: string };
        const sanitizedFilename = multerFile.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
        const filePath = `${folder}/${timestamp}-${sanitizedFilename}`;

        const { error } = await this.supabase.storage
            .from(this.bucketName)
            .upload(filePath, multerFile.buffer, {
                contentType: multerFile.mimetype,
                upsert: false,
            });

        if (error) {
            this.logger.error(`Failed to upload file: ${error.message}`);
            const errorWithStatus = error as { status?: string };
            const statusCode = parseInt(errorWithStatus.status || '500', 10);
            throw new HttpException(
                `Supabase Storage Error: ${error.message}`,
                isNaN(statusCode) ? HttpStatus.INTERNAL_SERVER_ERROR : statusCode,
            );
        }

        const { data: publicUrlData } = this.supabase.storage
            .from(this.bucketName)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    }
}
