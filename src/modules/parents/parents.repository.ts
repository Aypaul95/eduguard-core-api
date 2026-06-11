import {
  Prisma,
  PrismaClient,
  Parent,
  ParentStudent,
} from "@prisma/client";

export class ParentsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * ============================================================
   * CREATE PARENT
   * ============================================================
   */
  async create(
    data: Prisma.ParentCreateInput,
  ): Promise<Parent> {
    return this.prisma.parent.create({
      data,
    });
  }

  /**
   * ============================================================
   * FIND BY ID
   * ============================================================
   */
  async findById(parentId: string) {
    return this.prisma.parent.findUnique({
      where: {
        id: parentId,
      },
      include: {
        school: true,
        children: {
          include: {
            student: true,
          },
        },
      },
    });
  }

  /**
   * ============================================================
   * FIND BY PHONE + SCHOOL
   * ============================================================
   */
  async findByPhone(
    schoolId: string,
    phone: string,
  ) {
    return this.prisma.parent.findFirst({
      where: {
        schoolId,
        phone,
      },
    });
  }

  /**
   * ============================================================
   * FIND BY EMAIL + SCHOOL
   * ============================================================
   */
  async findByEmail(
    schoolId: string,
    email: string,
  ) {
    return this.prisma.parent.findFirst({
      where: {
        schoolId,
        email,
      },
    });
  }

  /**
   * ============================================================
   * FIND MANY
   * ============================================================
   */
  async findMany(
    where: Prisma.ParentWhereInput,
    skip: number,
    take: number,
  ) {
    const [data, total] = await Promise.all([
      this.prisma.parent.findMany({
        where,
        skip,
        take,
        include: {
          children: {
            include: {
              student: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),

      this.prisma.parent.count({
        where,
      }),
    ]);

    return {
      data,
      total,
    };
  }

  /**
   * ============================================================
   * FIND ALL BY SCHOOL
   * ============================================================
   */
  async findBySchool(
    schoolId: string,
  ) {
    return this.prisma.parent.findMany({
      where: {
        schoolId,
      },
      include: {
        children: {
          include: {
            student: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  /**
   * ============================================================
   * UPDATE
   * ============================================================
   */
  async update(
    parentId: string,
    data: Prisma.ParentUpdateInput,
  ): Promise<Parent> {
    return this.prisma.parent.update({
      where: {
        id: parentId,
      },
      data,
    });
  }

  /**
   * ============================================================
   * DELETE
   * ============================================================
   */
  async delete(
    parentId: string,
  ): Promise<Parent> {
    return this.prisma.parent.delete({
      where: {
        id: parentId,
      },
    });
  }

  /**
   * ============================================================
   * LINK STUDENT
   * ============================================================
   */
  async linkStudent(
    parentId: string,
    studentId: string,
    relationship: string,
  ): Promise<ParentStudent> {
    return this.prisma.parentStudent.create({
      data: {
        parentId,
        studentId,
        relationship,
      },
    });
  }

  /**
   * ============================================================
   * FIND PARENT-STUDENT LINK
   * ============================================================
   */
  async findParentStudentLink(
    parentId: string,
    studentId: string,
  ) {
    return this.prisma.parentStudent.findFirst({
      where: {
        parentId,
        studentId,
      },
    });
  }

  /**
   * ============================================================
   * UNLINK STUDENT
   * ============================================================
   */
  async unlinkStudent(
    linkId: string,
  ): Promise<ParentStudent> {
    return this.prisma.parentStudent.delete({
      where: {
        id: linkId,
      },
    });
  }

  /**
   * ============================================================
   * GET CHILDREN
   * ============================================================
   */
  async getChildren(
    parentId: string,
  ) {
    return this.prisma.parentStudent.findMany({
      where: {
        parentId,
      },
      include: {
        student: true,
      },
    });
  }

  /**
   * ============================================================
   * GET STUDENT PARENTS
   * ============================================================
   */
  async getStudentParents(
    studentId: string,
  ) {
    return this.prisma.parentStudent.findMany({
      where: {
        studentId,
      },
      include: {
        parent: true,
      },
    });
  }

  /**
   * ============================================================
   * DELETE ALL LINKS
   * ============================================================
   */
  async deleteAllLinks(
    parentId: string,
  ) {
    return this.prisma.parentStudent.deleteMany({
      where: {
        parentId,
      },
    });
  }

  /**
   * ============================================================
   * TRANSACTIONAL DELETE
   * ============================================================
   */
  async deleteParentWithLinks(
    parentId: string,
  ) {
    return this.prisma.$transaction([
      this.prisma.parentStudent.deleteMany({
        where: {
          parentId,
        },
      }),

      this.prisma.parent.delete({
        where: {
          id: parentId,
        },
      }),
    ]);
  }

  /**
   * ============================================================
   * COUNT
   * ============================================================
   */
  async count(
    where: Prisma.ParentWhereInput,
  ): Promise<number> {
    return this.prisma.parent.count({
      where,
    });
  }

  /**
   * ============================================================
   * EXISTS
   * ============================================================
   */
  async exists(
    parentId: string,
  ): Promise<boolean> {
    const parent =
      await this.prisma.parent.findUnique({
        where: {
          id: parentId,
        },
        select: {
          id: true,
        },
      });

    return !!parent;
  }
}