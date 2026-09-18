import express from 'express';
import { asyncHandler } from '../../shared/middleware/asyncHandler.middleware';
import { projectController } from './project.controller.js';
import { createProjectSchema, updateProjectSchema, convertLeadToProjectSchema } from './projects.schema';
import { validate } from '../../shared/middleware/validate.middeware';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { requirePermission } from '../../shared/middleware/requireRole.middleware';

const router = express.Router();
// Public create endpoint – no auth/tenant middleware
router.post('/create', validate({ body: createProjectSchema }), asyncHandler(projectController.createProject));
// Protected routes – require auth and tenant context
router.use(authGuard, tenantContext);
router.post('/convert-lead', validate({ body: convertLeadToProjectSchema }), asyncHandler(projectController.convertLead));
router.get('/project-all', requirePermission("projects:read"), asyncHandler(projectController.findAllProjects));
// Client portal routes must use the permission issued in the auth payload.
router.get('/view-own-project', requirePermission("projects:read:own"), asyncHandler(projectController.findOwnProjects));
router.get('/view-own-project/:id', requirePermission("projects:read:own"), asyncHandler(projectController.findOwnProjectById));
router.patch('/modify', requirePermission("projects:update"), validate({ body: updateProjectSchema }), asyncHandler(projectController.createProject));
router.get('/:id', requirePermission("projects:read"), asyncHandler(projectController.find));

export default router;
