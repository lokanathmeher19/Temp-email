"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestNumberSchema = void 0;
const zod_1 = require("zod");
exports.requestNumberSchema = zod_1.z.object({
    country: zod_1.z.string().min(2, 'Country code required'),
    service: zod_1.z.string().min(1, 'Service name required (e.g., Telegram)'),
});
