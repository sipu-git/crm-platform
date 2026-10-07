import express from 'express';
import multer from 'multer';
import { companyController } from './company.controller.js';
import { authGuard } from '../../shared/middleware/authGuard.middleware.js';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware.js';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware.js';
import { validate } from '../../shared/middleware/validate.middeware.js';
import { idParamSchema, updateCompanySchema } from './company.schema.js';
import { requirePermission } from '../../shared/middleware/requireRole.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = express.Router();
router.use(authGuard, tenantContext);

router.get('/view-company-list', requirePermission("company:read"), asyncHandler(companyController.viewListCompanies));
router.get('/filter-company-list', requirePermission("company:read"), asyncHandler(companyController.filters));
router.get('/view-own-company', requirePermission("company:read:own"), asyncHandler(companyController.getOwnCompany));
router.get('/:id', requirePermission("company:read"), validate({ params: idParamSchema }), asyncHandler(companyController.getById));
router.patch('/modify-company', requirePermission("company:update:own"), validate({ body: updateCompanySchema }), asyncHandler(companyController.update));
router.post('/upload-logo', requirePermission("company:update:own"), upload.single('file'), asyncHandler(companyController.uploadLogo));
router.post('/:id/logo', requirePermission("company:update"), validate({ params: idParamSchema }), upload.single('file'), asyncHandler(companyController.uploadLogo));
router.delete('/:id', requirePermission("company:delete"), validate({ params: idParamSchema }), asyncHandler(companyController.delete));

export default router;