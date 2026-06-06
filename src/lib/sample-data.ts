import type { Customer } from "@/types/customer";

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

function seededInt(min: number, max: number, seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
}

function randomDate(daysAgo: number): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function generateCustomer(index: number): Customer {
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const id = `CUST-${String(index + 1).padStart(4, "0")}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index > 50 ? index : ""}@email.com`;

  const tier = index % 10;
  let revenue: number;
  let orders: number;
  let daysAgo: number;

  if (tier <= 1) {
    revenue = seededInt(12000, 45000, index);
    orders = seededInt(15, 60, index + 1);
    daysAgo = seededInt(1, 45, index + 2);
  } else if (tier <= 4) {
    revenue = seededInt(5500, 9800, index);
    orders = seededInt(8, 25, index + 1);
    daysAgo = seededInt(10, 75, index + 2);
  } else if (tier <= 7) {
    revenue = seededInt(1500, 4800, index);
    orders = seededInt(3, 12, index + 1);
    daysAgo = seededInt(30, 120, index + 2);
  } else {
    revenue = seededInt(200, 1400, index);
    orders = seededInt(1, 5, index + 1);
    daysAgo = seededInt(60, 180, index + 2);
  }

  return {
    customer_id: id,
    customer_name: `${firstName} ${lastName}`,
    email,
    orders,
    revenue,
    last_purchase_date: randomDate(daysAgo),
  };
}

export const SAMPLE_CUSTOMERS: Customer[] = Array.from({ length: 120 }, (_, i) =>
  generateCustomer(i)
);

export const SAMPLE_CSV_HEADERS = [
  "customer_id",
  "customer_name",
  "email",
  "orders",
  "revenue",
  "last_purchase_date",
];

export function customersToCSV(customers: Customer[]): string {
  const rows = customers.map((c) =>
    [
      c.customer_id,
      c.customer_name,
      c.email,
      c.orders,
      c.revenue,
      c.last_purchase_date,
    ].join(",")
  );
  return [SAMPLE_CSV_HEADERS.join(","), ...rows].join("\n");
}
