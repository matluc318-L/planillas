import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@empresa.com";
  const password = "admin123";

  const existing = await prisma.usuario.findUnique({ where: { email } });
  if (existing) {
    console.log("Usuario admin ya existe.");
    return;
  }

  const hash = await bcrypt.hash(password, 10);
  await prisma.usuario.create({
    data: { email, password: hash },
  });

  console.log("Usuario creado:", email, "| contraseña:", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
