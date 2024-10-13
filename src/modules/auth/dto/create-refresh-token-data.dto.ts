import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateRefreshTokenDataDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    refreshToken: string;
}