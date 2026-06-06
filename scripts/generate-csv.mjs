import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const FIRST_NAMES = [
  "James", "Emma", "Michael", "Olivia", "William", "Sophia", "Alexander", "Isabella",
  "Benjamin", "Mia", "Daniel", "Charlotte", "Henry", "Amelia", "Sebastian", "Harper",
  "Matthew", "Evelyn", "Joseph", "Abigail", "David", "Emily", "Andrew", "Elizabeth",
  "Samuel", "Sofia", "Christopher", "Avery", "Joshua", "Ella", "Ryan", "Scarlett",
  "Nathan", "Grace", "Ethan", "Chloe", "Jacob", "Victoria", "Lucas", "Riley",
  "Mason", "Aria", "Logan", "Lily", "Jack", "Zoey", "Owen", "Penelope",
  "Gabriel", "Layla", "Carter", "Nora", "Jayden", "Camila", "Luke", "Hannah",
  "Anthony", "Lillian", "Isaac", "Addison", "Dylan", "Eleanor", "Leo", "Natalie",
  "Julian", "Luna", "Aaron", "Savannah", "Eli", "Brooklyn", "Adrian", "Leah",
  "Jonathan", "Zoe", "Nathaniel", "Stella", "Christian", "Hazel", "Landon", "Ellie",
  "Colton", "Paisley", "Axel", "Audrey", "Easton", "Skylar", "Cooper", "Violet",
  "Jeremiah", "Claire", "Angel", "Bella", "Roman", "Lucy", "Connor", "Anna",
  "Brooks", "Caroline", "Robert", "Genesis", "Jameson", "Aaliyah", "Ian", "Kennedy",
];

const LAST_NAMES = [
  "Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis",
  "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson",
  "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson",
  "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker",
  "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill",
  "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell",
  "Mitchell", "Carter", "Roberts", "Turner", "Phillips", "Evans", "Parker", "Collins",
  "Edwards", "Stewart", "Morris", "Murphy", "Cook", "Rogers", "Morgan", "Peterson",
  "Cooper", "Reed", "Bailey", "Bell", "Gomez", "Kelly", "Howard", "Ward",
  "Cox", "Diaz", "Richardson", "Wood", "Watson", "Brooks", "Bennett", "Gray",
  "James", "Reyes", "Cruz", "Hughes", "Price", "Myers", "Long", "Foster",
  "Sanders", "Ross", "Morales", "Powell", "Sullivan", "Russell", "Ortiz", "Jenkins",
];

function randomInt(min, max, seed) {
  const x = Math.sin(seed) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
}

function randomDate(daysAgo, seed) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

const rows = ["customer_id,customer_name,email,orders,revenue,last_purchase_date"];

for (let i = 0; i < 120; i++) {
  const firstName = FIRST_NAMES[i % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(i / FIRST_NAMES.length) % LAST_NAMES.length];
  const id = `CUST-${String(i + 1).padStart(4, "0")}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i > 50 ? i : ""}@email.com`;
  const tier = i % 10;

  let revenue, orders, daysAgo;
  if (tier <= 1) {
    revenue = randomInt(12000, 45000, i);
    orders = randomInt(15, 60, i + 1);
    daysAgo = randomInt(1, 45, i + 2);
  } else if (tier <= 4) {
    revenue = randomInt(5500, 9800, i);
    orders = randomInt(8, 25, i + 1);
    daysAgo = randomInt(10, 75, i + 2);
  } else if (tier <= 7) {
    revenue = randomInt(1500, 4800, i);
    orders = randomInt(3, 12, i + 1);
    daysAgo = randomInt(30, 120, i + 2);
  } else {
    revenue = randomInt(200, 1400, i);
    orders = randomInt(1, 5, i + 1);
    daysAgo = randomInt(60, 180, i + 2);
  }

  rows.push(`${id},${firstName} ${lastName},${email},${orders},${revenue},${randomDate(daysAgo, i)}`);
}

const outputPath = join(__dirname, "..", "public", "sample-customers.csv");
writeFileSync(outputPath, rows.join("\n"));
console.log(`Generated ${rows.length - 1} records to ${outputPath}`);
