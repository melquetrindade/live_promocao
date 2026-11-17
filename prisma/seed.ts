import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required to run the seed`);
  }
  return value;
}

const adminLogin = requiredEnv("ADMIN_LOGIN");
const adminPassword = requiredEnv("ADMIN_PASSWORD");
const databaseUrl = requiredEnv("DATABASE_URL");

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const senhaHash = await argon2.hash(adminPassword);

    await prisma.empresa.create({
      data: {
        nome: "Drogaria Nossa Senhora de Fátima",
        cnpj: "26877924000164",
        funcionarios: {
          create: {
            nome: "Melque Rodrigues",
            cargo: "ADMINISTRADOR",
            credencial: {
              create: {
                login: adminLogin,
                senhaHash,
              },
            },
          },
        },
      },
    });
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("Erro ao executar o seed:", error);
  process.exitCode = 1;
});