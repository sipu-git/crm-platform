import express from 'express';

import { companyController } from './company.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { validate } from '../../shared/middleware/validate.middeware.js';
import { idParamSchema, updateCompanySchema } from './company.schema.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const router = express.Router();
router.use(authGuard, tenantContext);

router.get('/view-company-list', requirePermission("company:read"), asyncHandler(companyController.viewListCompanies));
router.get('/filter-company-list', requirePermission("company:read"), asyncHandler(companyController.filters));
router.get('/:id', requirePermission("company:read"), validate({ params: idParamSchema }), asyncHandler(companyController.getById));
// router.post('/', validate({ body: createCompanySchema }), asyncHandler(companyController.create));
router.patch('/:id', requirePermission("company:update"), validate({ body: updateCompanySchema }), asyncHandler(companyController.update));
router.delete('/:id', requirePermission("company:delete"), validate({ params: idParamSchema }), asyncHandler(companyController.delete));

export default router;