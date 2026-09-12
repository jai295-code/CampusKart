const { PrismaClient } = require('@prisma/client');

// One client for the whole process. Importing this module from several places
// must not open a connection pool per module.
const prisma = new PrismaClient();

module.exports = prisma;
