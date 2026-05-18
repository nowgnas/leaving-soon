import "dotenv/config";
import { buildApp } from "./app.js";

const port = Number.parseInt(process.env.PORT ?? "3000", 10);
const host = process.env.HOST ?? "0.0.0.0";
const app = buildApp();

try {
  await app.listen({ port, host });
  console.log(`leaving-soon API running at http://${host}:${port}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
