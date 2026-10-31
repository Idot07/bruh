import { getDatabase } from './index';

console.log('Running database migrations...');

const db = getDatabase();

console.log('Migrations completed successfully!');
console.log('Database ready at:', process.cwd() + '/data/papers.db');