import { ProjectEnquiryStatus } from "../../../generated/prisma/enums";
import { PrismaClientTx } from "../../shared/utils/prisma.types";
import { EnquiryInput } from "./enquiry.schema";

export const enquiryRepository = {
    create(tx: PrismaClientTx, input: EnquiryInput) {
        return tx.enquiry.create({
            data: {
                company_name: input.company_name,
                first_name: input.first_name,
                last_name: input.last_name,
                email: input.email,
                phone: input.phone,
                designation: input.designation,
                project_name: input.project_name,
                project_type: input.project_type,
                source: input.source,
                isApproved: false,
                enquiryStatus: ProjectEnquiryStatus.PENDING,
                ...(input.timeline ? { timeline: input.timeline } : {}),
                ...(input.budget ? { budget: input.budget } : {}),
                ...(input.description ? { description: input.description } : {}),
            },
        })
    },

    viewEnquiry(tx: PrismaClientTx) {
        return tx.enquiry.findMany({
            orderBy: { created_at: 'desc' },
        });
    },

    findById(tx: PrismaClientTx, enquiryId: string) {
        return tx.enquiry.findFirst({ where: { id: enquiryId } });
    },

    findUserInTenant(tx: PrismaClientTx, tenantId: string, userId: string) {
        return tx.user.findFirst({ where: { tenantId, id: userId } });
    },

    markApproved(tx: PrismaClientTx, enquiryId: string) {
        return tx.enquiry.update({
            where: { id: enquiryId },
            data: {
                enquiryStatus: ProjectEnquiryStatus.APPROVED,
                isApproved: true
            },
        });
    },

    markRejected(tx: PrismaClientTx, enquiryId: string) {
        return tx.enquiry.update({
            where: { id: enquiryId },
            data: {
                enquiryStatus: ProjectEnquiryStatus.REJECTED,
                isApproved: false
            },
        });
    },

    dropEnquiry(tx: PrismaClientTx, enquiryId: string) {
        return tx.enquiry.delete({ where: { id: enquiryId } });
    },
}