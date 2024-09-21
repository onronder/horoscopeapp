import express from 'express';
import { 
  createTenant, 
  getAllTenants, 
  getTenantById, 
  updateTenant, 
  deleteTenant 
} from '../controllers/tenantControllers';
import { auth } from '../middleware/auth';

const router = express.Router();

// Create a new tenant
router.post('/', auth, createTenant);

// Get all tenants
router.get('/', auth, getAllTenants);

// Get a specific tenant by ID
router.get('/:id', auth, getTenantById);

// Update a tenant
router.put('/:id', auth, updateTenant);

// Delete a tenant
router.delete('/:id', auth, deleteTenant);

export default router;