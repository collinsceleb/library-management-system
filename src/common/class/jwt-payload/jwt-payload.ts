import { ApiProperty } from "@nestjs/swagger";
import { User } from "../../../modules/users/entities/user.entity";

export class JwtPayload {
    @ApiProperty({ example: '1' })
    sub: User;

    @ApiProperty({ example: 'example@example.com' })
    email: string;

    @ApiProperty({ example: '1234567890' })
    jwtId: string;
}
