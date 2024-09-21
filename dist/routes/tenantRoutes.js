"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const tenantControllers_1 = require("../controllers/tenantControllers");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create a new tenant
router.post('/', auth_1.auth, tenantControllers_1.createTenant);
// Get all tenants
router.get('/', auth_1.auth, tenantControllers_1.getAllTenants);
// Get a specific tenant by ID
router.get('/:id', auth_1.auth, tenantControllers_1.getTenantById);
// Update a tenant
router.put('/:id', auth_1.auth, tenantControllers_1.updateTenant);
// Delete a tenant
router.delete('/:id', auth_1.auth, tenantControllers_1.deleteTenant);
exports.default = router;
