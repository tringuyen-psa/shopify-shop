import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Omit<import("../users/entities/user.entity").User, "passwordHash">;
    }>;
    login(loginDto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Omit<import("../users/entities/user.entity").User, "passwordHash">;
    }>;
    refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: Omit<import("../users/entities/user.entity").User, "passwordHash">;
    }>;
    getCurrentUser(req: any): Promise<Omit<import("../users/entities/user.entity").User, "passwordHash">>;
}
