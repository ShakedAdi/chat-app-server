import { Prisma } from '../generated/prisma/client';

export const isPrismaError = (
  e: unknown,
  code: string,
): e is Prisma.PrismaClientKnownRequestError =>
  e instanceof Prisma.PrismaClientKnownRequestError && e.code === code;
