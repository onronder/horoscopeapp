import { Request, Response, NextFunction } from 'express';
import Tenant from '../models/Tenant';

export interface TenantRequest extends Request {
  tenantId?: string;
}

export const identifyTenant = async (req: TenantRequest, res: Response, next: NextFunction) => {
  const domain = req.get('host');
  try {
    const tenant = await Tenant.findOne({ domain, isActive: true });
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    req.tenantId = tenant.tenantId;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Error identifying tenant' });
  }
};