import { readFileSync } from "node:fs";
import mysql from "mysql2/promise";

const importFile = "/home/ubuntu/webdev-static-assets/alrawhaa_ultimate_collection/weej-products-import.sql";
const sql = readFileSync(importFile, "utf8");

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to import products.");
const connection = await mysql.createConnection(process.env.DATABASE_URL);

try {
  const [result] = await connection.execute(sql);
  const [rows] = await connection.query("SELECT COUNT(*) AS importedProducts FROM products WHERE slug LIKE 'weej-import-%'");
  console.log(JSON.stringify({ affectedRows: result.affectedRows, importedProducts: rows[0].importedProducts }));
} finally {
  await connection.end();
}
