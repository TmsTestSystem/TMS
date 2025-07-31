import { Pool } from 'pg';
declare const pool: Pool;
export declare const connectDB: () => Promise<void>;
export declare const query: (text: string, params?: any[]) => Promise<import("pg").QueryResult<any>>;
export default pool;
//# sourceMappingURL=database.d.ts.map