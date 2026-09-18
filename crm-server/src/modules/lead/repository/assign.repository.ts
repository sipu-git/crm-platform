import { ApiError } from "../../../shared/utils/ApiError";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { CreateAssignInputs } from "../validations/assign.schema";

export const assignRepository = {
  async create(tx: PrismaClientTx, tenantId: string, leadId: string, data: CreateAssignInputs) {
    if (data.assignId) {
      // First try to find an Assignee by its own ID
      const assigneeById = await tx.assignee.findFirst({
        where: { id: data.assignId, tenant_id: tenantId },
      });

      if (assigneeById) {
        // Directly assign the lead to this existing Assignee
        const lead = await tx.leads.update({
          where: { id: leadId, tenant_id: tenantId },
          data: { assigned_to: assigneeById.id },
          include: {
            assignee: {
              include: { user: { select: { id: true, full_name: true, email: true, role: true, mobile: true } } },
            },
          },
        });
        return lead;
      }

      // Not found as Assignee ID – treat assignId as a User ID (fallback)
      data.userId = data.assignId;
    }

    // -------------------------------------------------------------------
    // Path for handling assignment by userId (including creation/reuse of Assignee)
    // -------------------------------------------------------------------
    let full_name = data.full_name;
    let designation = data.designation;
    let department = data.department;
    let email = data.email;

    if (data.userId) {
      const user = await tx.user.findFirst({
        where: { id: data.userId, tenantId: tenantId },
        select: { full_name: true, role: true, email: true },
      });

      if (!user) {
        throw ApiError.notFound("User not found in this workspace");
      }

      full_name = full_name ?? user.full_name;
      email = email ?? user.email;
      designation = designation ?? "Sales Rep";

      // Check if an Assignee record already exists for this user (userId is @unique)
      const existingAssignee = await tx.assignee.findFirst({
        where: { userId: data.userId, tenant_id: tenantId },
      });

      if (existingAssignee) {
        // Reuse existing Assignee – just link the lead
        const lead = await tx.leads.update({
          where: { id: leadId, tenant_id: tenantId },
          data: { assigned_to: existingAssignee.id },
          include: {
            assignee: {
              include: {
                user: {
                  select: {
                    id: true,
                    full_name: true,
                    email: true,
                    role: true,
                    mobile: true,
                  },
                },
              },
            },
          },
        });
        return lead;
      }
    }

    // ── Path 3: create a new Assignee row ──
    if (!full_name || !designation) {
      throw ApiError.badRequest("full_name and designation are required when no userId is provided");
    }

    const assignee = await tx.assignee.create({
      data: {
        tenant_id: tenantId,
        full_name,
        designation,
        email,
        department,
        userId: data.userId ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
            mobile: true,
          },
        },
        leads: true,
      },
    });

    const lead = await tx.leads.update({
      where: { id: leadId, tenant_id: tenantId },
      data: { assigned_to: assignee.id },
      include: {
        assignee: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
                role: true,
                mobile: true,
              },
            },
          },
        },
      },
    });

    return lead;
  },

  viewAssignee(tx: PrismaClientTx, tenantId: string, id: string) {
    return tx.assignee.findFirst({
      where: {
        id,
        tenant_id: tenantId,
      },
      include: {
        leads: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
            mobile: true,
          },
        },
      },
    });
  },

  viewOwnAssignee(tx: PrismaClientTx, tenantId: string, userId: string) {
    return tx.assignee.findFirst({
      where: {
        userId,
        tenant_id: tenantId,
      },
      include: {
        leads: true
      },
    });
  },

  findAllByTenant(tx: PrismaClientTx, tenantId: string) {
    return tx.assignee.findMany({
      where: { tenant_id: tenantId },
      orderBy: { full_name: "asc" },
      include: {
        leads: true,
        user: {
          select: {
            id: true,
            full_name: true,
            email: true,
            role: true,
            mobile: true,
          },
        },
      },
    });
  },
};