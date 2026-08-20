import express from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { projectController } from './project.controller.js';
import { createProjectSchema, updateProjectSchema,convertLeadToProjectSchema } from './projects.schema';
import { validate } from '../../shared/middleware/validate.middeware';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';

const router = express.Router();
router.use(authGuard, tenantContext);

router.post('/create', validate({ body: createProjectSchema }), asyncHandler(projectController.createProject));
router.post('/convert-lead', validate({ body: convertLeadToProjectSchema }), asyncHandler(projectController.convertLead));
router.get('/view', asyncHandler(projectController.createProject));
router.patch('/modify', validate({ body: updateProjectSchema }), asyncHandler(projectController.createProject));

export default router;