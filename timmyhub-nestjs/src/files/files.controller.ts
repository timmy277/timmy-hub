import {
    Controller,
    Post,
    UploadedFile,
    UseInterceptors,
    ParseFilePipe,
    MaxFileSizeValidator,
    HttpStatus,
    FileValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SupabaseService } from '../common/supabase/supabase.service';
import {
    ALLOWED_IMAGE_TYPES,
    MAX_FILE_SIZE,
    ALLOWED_MEDIA_TYPES,
    MAX_MEDIA_SIZE,
} from '../common/constants/file.constant';

// Custom validator that checks mimetype
class MimeTypeValidator extends FileValidator<{ mimeTypes: string[] }> {
    buildErrorMessage(): string {
        const allowed = this.validationOptions.mimeTypes.join(', ');
        return `File type not allowed. Allowed types: ${allowed}`;
    }

    isValid(file: Express.Multer.File): boolean {
        if (!file) return false;
        const multerFile = file as { mimetype: string };
        return this.validationOptions.mimeTypes.includes(multerFile.mimetype);
    }
}

@ApiTags('Files')
@Controller('files')
export class FilesController {
    constructor(private readonly supabaseService: SupabaseService) {}

    @Post('upload-media')
    @ApiOperation({ summary: 'Upload ảnh hoặc video review lên Supabase Storage (max 50MB)' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadMedia(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_MEDIA_SIZE }),
                    new MimeTypeValidator({ mimeTypes: ALLOWED_MEDIA_TYPES }),
                ],
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            }),
        )
        file: Express.Multer.File,
    ) {
        const url = await this.supabaseService.uploadFile(file);
        const isVideo = file.mimetype.startsWith('video/');
        return { url, type: isVideo ? 'video' : 'image' };
    }

    @Post('upload')
    @ApiOperation({ summary: 'Upload a file to Supabase Storage' })
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
                folder: {
                    type: 'string',
                    default: 'uploads',
                },
            },
        },
    })
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE }),
                    new MimeTypeValidator({ mimeTypes: ALLOWED_IMAGE_TYPES }),
                ],
                errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
            }),
        )
        file: Express.Multer.File,
    ) {
        const url = await this.supabaseService.uploadFile(file);
        return { url };
    }
}
