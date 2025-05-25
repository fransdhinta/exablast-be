import { Role } from '@prisma/client';

export class UserProfileDto {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: Date;
}