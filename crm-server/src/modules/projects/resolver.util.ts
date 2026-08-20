import { Source } from "../../../generated/prisma/enums";
import { ApiError } from "../../shared/utils/ApiError";
import { PrismaClientTx } from "../../shared/utils/prisma.types";
import { companyRepository } from "../company/company.repository";
import { contactsRepository } from "../contact/contact.repository";

export const companyContactResolver = {
    async resolveCompany(tx: PrismaClientTx, tenantId: string, creator: string, companyId: string | undefined,
        company_name: string,
        source: Source,
    ) {
        if (companyId) {
            const existing = await companyRepository.findCompany(tx, tenantId, companyId);
            if (existing) return existing;
        }
        return companyRepository.upsertStubByName(tx, tenantId, creator, company_name.trim(), source);
    },

    async resolveContact(tx: PrismaClientTx, tenantId: string, creator: string, companyId: string, contactId: string | undefined,
        contactInput: {
            first_name?: string;
            last_name?: string;
            email?: string;
            phone?: string;
            designation?: string;
        },
    ) {
        if (contactId) {
            const existing = await contactsRepository.findById(tx, tenantId, contactId);
            if (existing) return existing;
        }

        const existingByLookup = contactInput.email ? await tx.contacts.findFirst({
            where: { tenant_id: tenantId, companyId, email: contactInput.email },
        }) : contactInput.phone ? await tx.contacts.findFirst({
            where: { tenant_id: tenantId, companyId, phone: contactInput.phone },
        }) : null;

        if (existingByLookup) return existingByLookup;

        if (!contactInput.first_name) {
            throw ApiError.badRequest("first_name is required to create a new contact");
        }

        return contactsRepository.create(tx, tenantId, creator, {
            companyId,
            firstName: contactInput.first_name.trim(),
            lastName: contactInput.last_name ?? "",
            email: contactInput.email ?? "",
            phone: contactInput.phone ?? "",
            designation: contactInput.designation ?? "",
        });
    },
};