import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import bcrypt from "bcryptjs";
import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";

const DEMO_PASSWORD = "demo1234";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");

  const prisma = new PrismaClient({ adapter: new PrismaBetterSqlite3({ url }) });

  await prisma.projectMembership.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const orgA = await prisma.organization.create({ data: { name: "Org A" } });
  const orgB = await prisma.organization.create({ data: { name: "Org B" } });

  await prisma.user.create({
    data: { email: "super@demo.test", passwordHash, role: "SUPERADMIN", orgId: null },
  });

  await prisma.user.create({
    data: { email: "admin-a@demo.test", passwordHash, role: "ADMIN", orgId: orgA.id },
  });
  const memberA1 = await prisma.user.create({
    data: { email: "member1-a@demo.test", passwordHash, role: "MEMBER", orgId: orgA.id },
  });
  await prisma.user.create({
    data: { email: "member2-a@demo.test", passwordHash, role: "MEMBER", orgId: orgA.id },
  });

  await prisma.user.create({
    data: { email: "admin-b@demo.test", passwordHash, role: "ADMIN", orgId: orgB.id },
  });
  const memberB = await prisma.user.create({
    data: { email: "member-b@demo.test", passwordHash, role: "MEMBER", orgId: orgB.id },
  });

  const projectA1 = await prisma.project.create({ data: { name: "Org A — Project 1", orgId: orgA.id } });
  const projectA2 = await prisma.project.create({ data: { name: "Org A — Project 2", orgId: orgA.id } });
  await prisma.project.create({ data: { name: "Org A — Orphan Project", orgId: orgA.id } });

  const projectB1 = await prisma.project.create({ data: { name: "Org B — Project 1", orgId: orgB.id } });
  await prisma.project.create({ data: { name: "Org B — Project 2", orgId: orgB.id } });

  await prisma.projectMembership.createMany({
    data: [
      { userId: memberA1.id, projectId: projectA1.id },
      { userId: memberA1.id, projectId: projectA2.id },
      { userId: memberB.id, projectId: projectB1.id },
    ],
  });

  const counts = {
    organizations: await prisma.organization.count(),
    users: await prisma.user.count(),
    projects: await prisma.project.count(),
    memberships: await prisma.projectMembership.count(),
  };
  console.log("Seeded:", counts);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
