import express from 'express';

import { companyController } from './company.controller';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { validate } from '../../shared/middleware/validate.middeware';
import { createCompanySchema, idParamSchema, updateCompanySchema } from './company.schema';

const router = express.Router();
router.use(authGuard, tenantContext);

router.get('/view-company-list', asyncHandler(companyController.viewListCompanies));
router.get('/filter-company-list', asyncHandler(companyController.filters));
router.get('/:id', validate({ params: idParamSchema }), asyncHandler(companyController.getById));
router.post('/', validate({ body: createCompanySchema }), asyncHandler(companyController.create));
router.patch('/:id', validate({ body: updateCompanySchema }), asyncHandler(companyController.update));
router.delete('/:id', validate({ params: idParamSchema }), asyncHandler(companyController.delete));

export default router;