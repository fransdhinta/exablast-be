import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserProfileDto } from './dto/auth-profile.dto';
import { TokenBlacklistService } from './token-blacklist.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService, 
    private usersService: UsersService,
    private tokenBlacklistService: TokenBlacklistService,
    private jwtService: JwtService,
  ) {}

  @Post('register')
  async register(@Body() body: { email: string; name: string; password: string, role: string }) {
    return this.usersService.createUser(body.email, body.name, body.password, body.role as Role);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req): Promise<UserProfileDto> {
    return this.authService.getProfile(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Request() req) {
    try {
      // Get the token from authorization header
      const authHeader = req.headers.authorization;
      const token = authHeader?.split(' ')[1];
      
      if (token) {
        // Decode the token to get the expiry time
        const decoded = this.jwtService.decode(token);
        if (decoded && typeof decoded === 'object' && decoded.exp) {
          // Add to blacklist until it expires
          this.tokenBlacklistService.blacklistToken(token, decoded.exp);
        }
      }
      
      return { message: 'Logout successful' };
    } catch (error) {
      return { message: 'Logout successful' };
    }
  }
}
