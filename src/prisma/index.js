// Bridge to top-level prisma/index.js
// This file re-exports the project's Prisma client so imports like
// `@/prisma` work while keeping the canonical implementation in /prisma.
import prisma from '../../prisma/index.js';

export default prisma;
