"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
console.log('Running database migrations...');
const db = (0, index_1.getDatabase)();
console.log('Migrations completed successfully!');
console.log('Database ready at:', process.cwd() + '/data/papers.db');
//# sourceMappingURL=migrate.js.map