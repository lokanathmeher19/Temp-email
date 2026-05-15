"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMailboxSchema = void 0;
const zod_1 = require("zod");
exports.createMailboxSchema = zod_1.z.object({
    username: zod_1.z.string().regex(/^[a-zA-Z0-9._-]+$/, 'Invalid username format').optional(),
    domain: zod_1.z.string().optional(),
});
