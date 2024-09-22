"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.identifyTenant = void 0;
const Tenant_1 = __importDefault(require("../models/Tenant"));
const identifyTenant = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const domain = req.get('host');
    try {
        const tenant = yield Tenant_1.default.findOne({ domain, isActive: true });
        if (!tenant) {
            return res.status(404).json({ message: 'Tenant not found' });
        }
        req.tenantId = tenant.tenantId;
        next();
    }
    catch (error) {
        res.status(500).json({ message: 'Error identifying tenant' });
    }
});
exports.identifyTenant = identifyTenant;
