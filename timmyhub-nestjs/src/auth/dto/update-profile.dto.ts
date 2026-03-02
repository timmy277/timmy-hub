import { createZodDto } from 'nestjs-zod';
import { UpdateProfileSchema } from '@timmyhub/shared';

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
