import { prisma } from "../../../lib/prisma"
import { ApiError } from "../../shared/utils/ApiError";
import { leadsRepository } from "../lead/repository/lead.repository";
import { projectService } from "../projects/project.service";
import { enquiryRepository } from "./enquiry.repository";
import { EnquiryInput } from "./enquiry.schema"

export const enquiryService = {
  async createEnquiry(input: EnquiryInput) {
    return await prisma.$transaction(async (tx) => {
      return await enquiryRepository.create(tx, input);
    });
  },
  async listEnquiry() {
    return await prisma.$transaction(async (tx) => {
      return enquiryRepository.viewEnquiry(tx);
    })
  },
  async findById(id: string) {
    return await prisma.$transaction(async (tx) => {
      return enquiryRepository.findById(tx, id);
    })
  },
  async markEnquiryAsApproved(tenantId: string, userId: string, enquiryId: string) {
    return await prisma.$transaction(async (tx) => {
      const staffUser = await enquiryRepository.findUserInTenant(tx, tenantId, userId);
      if (!staffUser) {
        throw ApiError.forbidden('You are not authorized to approve enquiries for this tenant');
      }
      const enquiry = await enquiryRepository.findById(tx, enquiryId);
      if (!enquiry) throw ApiError.notFound('Enquiry not found');
      if (enquiry.isApproved) {
        throw ApiError.badRequest('Enquiry has already been approved');
      }
      if (!enquiry.project_name) {
        throw ApiError.badRequest('Enquiry is missing a project name and cannot be approved yet');
      }
      const project = await projectService.createProject({
        tenantId,
        companyId: undefined,
        contactId: undefined,
        creatorId: staffUser.id,
        enquiryId: enquiry.id,
        contactInput: {
          first_name: enquiry.first_name ?? undefined,
          last_name: enquiry.last_name ?? undefined,
          email: enquiry.email?.trim().toLowerCase() || `no-email-${enquiry.id}@invalid.local`,
          phone: enquiry.phone ?? undefined,
          designation: enquiry.designation ?? undefined,
        },
        data: {
          company_name: enquiry.company_name,
          project_name: enquiry.project_name,
          project_type: enquiry.project_type,
          source: enquiry.source,
          ...(enquiry.description ? { description: enquiry.description } : {}),
          ...(enquiry.timeline ? { timeline: enquiry.timeline } : {}),
          ...(enquiry.budget ? { budget: enquiry.budget } : {}),
        },
      });
      await enquiryRepository.markApproved(tx, enquiryId);
      return project;
    })
  },
  async markRemoved(tenantId: string, userId: string, enquiryId: string) {
    return await prisma.$transaction(async (tx) => {
      const staffUser = await enquiryRepository.findUserInTenant(tx, tenantId, userId);
      if (!staffUser) {
        throw ApiError.forbidden('You are not authorized to remove enquiries for this tenant');
      }
      const enquiry = await enquiryRepository.findById(tx, enquiryId);
      if (!enquiry) throw ApiError.notFound('Enquiry not found');
      if (enquiry.enquiryStatus==="REJECTED") throw ApiError.badRequest('Enquiry has not been approved');
      return enquiryRepository.markRejected(tx, enquiryId);
    })
  },
  async dropEnquiry(tenantId: string, userId: string, enquiryId: string) {
    return await prisma.$transaction(async (tx) => {
      const staffUser = await enquiryRepository.findUserInTenant(tx, tenantId, userId);
      if (!staffUser) {
        throw ApiError.forbidden('You are not authorized to remove enquiries for this tenant');
      }

      const enquiry = await enquiryRepository.findById(tx, enquiryId);
      if (!enquiry) throw ApiError.notFound('Enquiry not found');

      const matchingLead = await leadsRepository.findByEnquiry(tx, tenantId, enquiry);
      if (matchingLead) {
        await leadsRepository.deleteLead(tx, tenantId, matchingLead.id);
      }

      return enquiryRepository.dropEnquiry(tx, enquiryId);
    })
  },
}