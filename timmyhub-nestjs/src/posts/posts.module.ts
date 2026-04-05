import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { PostsGateway } from './posts.gateway';
import { DatabaseModule } from '../database/database.module';

@Module({
    imports: [DatabaseModule],
    controllers: [PostsController],
    providers: [PostsService, PostsGateway],
    exports: [PostsService, PostsGateway],
})
export class PostsModule {}
