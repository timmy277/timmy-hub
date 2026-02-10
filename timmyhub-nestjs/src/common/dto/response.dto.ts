import { ApiProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
    @ApiProperty()
    success: boolean;

    @ApiProperty()
    message: string;

    @ApiProperty({ required: false })
    data?: T;

    @ApiProperty({ required: false })
    error?: unknown;

    @ApiProperty()
    timestamp: string;

    constructor(success: boolean, message: string, data?: T, error?: unknown) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
        this.timestamp = new Date().toISOString();
    }

    static success<T>(message: string, data?: T): ResponseDto<T> {
        return new ResponseDto(true, message, data);
    }

    static error<T>(message: string, error?: unknown): ResponseDto<T> {
        return new ResponseDto<T>(false, message, undefined as any, error);
    }
}
