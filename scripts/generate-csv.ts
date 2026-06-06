import { SAMPLE_CUSTOMERS, customersToCSV } from "../src/lib/sample-data";
import { writeFileSync } from "fs";
import { join } from "path";

const csv = customersToCSV(SAMPLE_CUSTOMERS);
writeFileSync(join(process.cwd(), "public", "sample-customers.csv"), csv);
console.log(`Wrote ${SAMPLE_CUSTOMERS.length} records`);
