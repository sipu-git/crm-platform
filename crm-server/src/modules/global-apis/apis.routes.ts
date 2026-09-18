import express from 'express';
import { authGuard } from '../../shared/middleware/authGuard.middleware';
import { tenantContext } from '../../shared/middleware/tenantContext.middleware';
import { searchController } from './apis.controller';

const router = express.Router();

router.use(authGuard, tenantContext);

router.get('/search', searchController.search);

export default router;