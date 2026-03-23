import { promises as fs } from 'node:fs';
import path from 'node:path';
import * as bcrypt from 'bcrypt';
import type { PrismaClient } from '@prisma/client';

interface DefaultUserSeed {
  id: string;
  name: string;
  email: string;
  password: string;
  admin?: boolean;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

async function readDefaultUsers(): Promise<DefaultUserSeed[]> {
  const filePath = path.join(
    process.cwd(),
    'prisma',
    'seed',
    'data',
    'default-users.json',
  );
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw) as DefaultUserSeed[];
}

export async function seedAuthDefaultUsers(
  prisma: PrismaClient,
): Promise<void> {
  const users = await readDefaultUsers();

  for (const seedUser of users) {
    const email = seedUser.email.trim().toLowerCase();
    const createdAt = new Date(seedUser.createdAt);
    const updatedAt = new Date(seedUser.updatedAt);
    const deletedAt = seedUser.deletedAt ? new Date(seedUser.deletedAt) : null;

    const user = await prisma.user.upsert({
      where: {
        email,
      },
      update: {
        name: seedUser.name,
        admin: seedUser.admin ?? false,
        avatarUrl: seedUser.avatarUrl ?? null,
        createdAt,
        updatedAt,
        deletedAt,
      },
      create: {
        id: seedUser.id,
        name: seedUser.name,
        email,
        admin: seedUser.admin ?? false,
        avatarUrl: seedUser.avatarUrl ?? null,
        createdAt,
        updatedAt,
        deletedAt,
      },
    });

    const activePassword = await prisma.password.findFirst({
      where: {
        userId: user.id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasSamePassword = activePassword
      ? await bcrypt.compare(seedUser.password, activePassword.hash)
      : false;

    if (hasSamePassword) {
      continue;
    }

    const hash = await bcrypt.hash(seedUser.password, 10);

    await prisma.password.create({
      data: {
        userId: user.id,
        hash,
      },
    });
  }
}
