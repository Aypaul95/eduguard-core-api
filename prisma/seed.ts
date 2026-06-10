import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * Seed configuration
 */
const SEED_SCHOOL = {
  name: "EduGuard Demo School",
  email: "admin@eduguard.com",
  phone: "+2348000000000",
  address: "Lagos, Nigeria",
};

const SEED_ADMIN = {
  firstName: "Super",
  lastName: "Admin",
  email: "admin@eduguard.com",
  password: "Admin@12345",
};

/**
 * Helper: log with timestamp
 */
const log = (message: string, data?: any) => {
  console.log(`[SEED] ${message}`, data ?? "");
};

/**
 * Main seed function
 */
async function main() {
  try {
    log("Starting database seed...");

    /**
     * 1. Create or find School
     */
    const school = await prisma.school.upsert({
      where: { email: SEED_SCHOOL.email },
      update: {},
      create: {
        name: SEED_SCHOOL.name,
        email: SEED_SCHOOL.email,
        phone: SEED_SCHOOL.phone,
        address: SEED_SCHOOL.address,
      },
    });

    log("School ready", school.id);

    /**
     * 2. Create Super Admin user
     */
    const hashedPassword = await bcrypt.hash(SEED_ADMIN.password, 10);

    const adminUser = await prisma.user.upsert({
      where: { email: SEED_ADMIN.email },
      update: {},
      create: {
        schoolId: school.id,
        firstName: SEED_ADMIN.firstName,
        lastName: SEED_ADMIN.lastName,
        email: SEED_ADMIN.email,
        passwordHash: hashedPassword,
        isActive: true,
      },
    });

    log("Admin user ready", adminUser.id);

    /**
     * 3. Create default roles (multi-school-safe)
     */
    const roles = Object.values(UserRole);

    for (const roleName of roles) {
      await prisma.role.upsert({
        where: {
          schoolId_name: {
            schoolId: school.id,
            name: roleName,
          },
        },
        update: {},
        create: {
          schoolId: school.id,
          name: roleName,
          description: `${roleName} role`,
        },
      });
    }

    log("Roles seeded", roles);

    /**
     * 4. Assign SUPER_ADMIN role to admin
     */
    const superAdminRole = await prisma.role.findFirst({
      where: {
        schoolId: school.id,
        name: UserRole.SUPER_ADMIN,
      },
    });

    if (!superAdminRole) {
      throw new Error("SUPER_ADMIN role not found after seeding");
    }

    await prisma.userRoleAssignment.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: superAdminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: superAdminRole.id,
      },
    });

    log("Admin role assigned");

    log("✅ Seeding completed successfully");
  } catch (error) {
    console.error("[SEED ERROR]", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Run seed
 */
main();