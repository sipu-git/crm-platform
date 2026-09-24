import express from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { projectController } from './project.controller.js';
import { createProjectSchema, updateProjectSchema, convertLeadToProjectSchema } from './projects.schema';
import { validate } from '../../shared/middleware/validate.middeware';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { requirePermission } from '../../shared/middleware/requireRole.middleware';

const router = express.Router();

router.post('/create', validate({ body: createProjectSchema }), asyncHandler(projectController.createProject));
router.use(authGuard, tenantContext);

router.post('/convert-lead', validate({ body: convertLeadToProjectSchema }), asyncHandler(projectController.convertLead));
router.get('/project-all', requirePermission("projects:read"), asyncHandler(projectController.findAllProjects));
router.get('/view-own-project', requirePermission("projects:read:own"), asyncHandler(projectController.findOwnProjects));
router.patch('/modify', requirePermission("projects:update"), validate({ body: updateProjectSchema }), asyncHandler(projectController.createProject));
router.get('/:id', asyncHandler(projectController.find));

export default router;
