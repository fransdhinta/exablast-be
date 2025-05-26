import { Injectable, BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // You’ll need to create this
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, name: string, password: string, role: Role) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
        role: role
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async updateUser(userId: string, updateUserDto: UpdateUserDto) {
    // If updating password, verify current password first
    if (updateUserDto.password) {
      if (!updateUserDto.currentPassword) {
        throw new BadRequestException('Current password is required to update password');
      }
      
      const user = await this.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }
      
      const isPasswordValid = await bcrypt.compare(updateUserDto.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }
      
      // Hash the new password
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    
    // If updating email, check if it's already taken
    if (updateUserDto.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email }
      });
      
      if (existingUser && existingUser.id !== userId) {
        throw new BadRequestException('Email is already in use');
      }
    }
    
    // Remove currentPassword from the data to be updated
    const { currentPassword, ...updateData } = updateUserDto;
    
    // Update the user
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
    
    // Remove password from the returned user object
    const { password, ...result } = updatedUser;
    return result;
  }
}
