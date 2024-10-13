import { User } from "src/modules/users/entities/user.entity";

export interface JwtPayload {
    sub: User;
    email: string;
    jwtId: string;
}
