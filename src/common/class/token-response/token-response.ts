import { ApiProperty } from "@nestjs/swagger";

export class TokenResponse {
    @ApiProperty()
    accessToken: string;

    @ApiProperty()
    refreshToken: string;

    @ApiProperty()
    uniqueDeviceId: string;
    
    @ApiProperty({
        example: {}
    })
    session: {};

    @ApiProperty({
        example: 'session-id'
    })
    sessionId: string
}
