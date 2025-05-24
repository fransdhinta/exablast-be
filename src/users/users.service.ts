import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // You’ll need to create this
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async createUser(email: string, name: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    return this.prisma.user.create({
      data: {
        email,
        name,
        password: hashed,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
