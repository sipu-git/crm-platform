import express from 'express';
import { asyncHandler } from '../../../shared/middleware/asyncHandler.middleware';
import { invoiceItemsController } from './items.controller';

const router = express.Router({mergeParams:true});

router.get('/', asyncHandler(invoiceItemsController.list));
router.post('/', asyncHandler(invoiceItemsController.create));
router.get('/:id', asyncHandler(invoiceItemsController.getById));
router.patch('/:id', asyncHandler(invoiceItemsController.update));
router.delete('/:id', asyncHandler(invoiceItemsController.remove));

export default router;