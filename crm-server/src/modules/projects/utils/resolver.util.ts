import { Source } from "../../../../generated/prisma/enums";
import { PrismaClientTx } from "../../../shared/utils/prisma.types";
import { companyRepository } from "../../company/company.repository";
import { contactsRepository } from "../../contact/contact.repository";

export const companyContactResolver = {
    async resolveCompany(tx: PrismaClientTx, tenantId: string, creator: string | undefined, companyId: string | undefined,
        company_name: string,
        source: Source,
    ) {
        if (companyId) {
            const existing = await companyRepository.findCompany(tx, tenantId, companyId);
            if (existing) return existing;
        }
        return companyRepository.upsertStubByName(tx, tenantId, creator, company_name.trim(), source);
    },

    async resolveContact(tx: PrismaClientTx, tenantId: string, creator: string | undefined,
         companyId: string, contactId: string | undefined,
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
            where: { tenant_id: tenantId, email: contactInput.email },
        }) : contactInput.phone ? await tx.contacts.findFirst({
            where: { tenant_id: tenantId, companyId, phone: contactInput.phone },
        }) : null;

        if (existingByLookup) return existingByLookup;

        return contactsRepository.create(tx, tenantId, creator, {
          companyId,
          firstName: contactInput.first_name?.trim() || "Unknown",
          lastName: contactInput.last_name ?? "",
          email: contactInput.email ?? "",
          phone: contactInput.phone ?? "",
          designation: contactInput.designation ?? "",
        });
    },
};