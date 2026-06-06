# Nexus CDP — AI Customer Data Platform & Engagement Suite

A production-ready enterprise SaaS application for retail customer analytics, AI-driven business insights, segmentation, churn prediction, and marketing automation. Built to demonstrate Forward Deployed Engineer capabilities at an AI-native B2B SaaS company.

Next.js
TypeScript
Tailwind CSS
Gemini AI

## Features

- **Executive Dashboard** — KPIs, revenue trends, segment distribution, top customers
- **CSV Data Upload** — PapaParse-powered import with localStorage persistence
- **Data Quality Center** — Duplicate detection, validation, one-click cleaning
- **Customer Segmentation** — High/Medium/Low value classification with charts
- **AI Business Analyst** — Gemini-powered chat with streaming responses
- **Marketing Campaign Generator** — AI-generated emails, SMS, loyalty, and re-engagement campaigns
- **Churn Prediction** — Risk scoring based on purchase recency
- **API Playground** — REST API testing, webhook simulation, request logging

## Tech Stack


| Layer       | Technology               |
| ----------- | ------------------------ |
| Framework   | Next.js 15 (App Router)  |
| Language    | TypeScript               |
| Styling     | Tailwind CSS + Shadcn UI |
| AI          | Google Gemini API        |
| Charts      | Recharts                 |
| CSV Parsing | PapaParse                |
| Icons       | Lucide React             |
| Deployment  | Vercel                   |


## Quick Start

```bash
# Clone and install
npm install

# Configure environment
cp .env.example .env.local
# Add your GEMINI_API_KEY to .env.local

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app loads with 120 sample customer records by default.

## Environment Variables


| Variable         | Description                           |
| ---------------- | ------------------------------------- |
| `GEMINI_API_KEY` | Google Gemini API key for AI features |


## Project Structure

```
src/
├── app/
│   ├── (app)/              # Main application pages
│   │   ├── dashboard/      # Executive dashboard
│   │   ├── upload/         # CSV data upload
│   │   ├── data-quality/   # Data validation & cleaning
│   │   ├── segmentation/   # Customer segments
│   │   ├── ai-analyst/     # AI chat interface
│   │   ├── marketing/      # Campaign generator
│   │   ├── churn/          # Churn analysis
│   │   └── api-playground/ # API testing
│   └── api/                # API route handlers
│       ├── ai/             # Gemini AI endpoints
│       ├── customers/      # Customer data API
│       ├── metrics/        # Analytics API
│       └── webhook/        # Webhook receiver
├── components/
│   ├── dashboard/          # Chart & stat components
│   ├── layout/             # Sidebar, navbar, shell
│   ├── providers/          # React context providers
│   ├── shared/             # Empty states, skeletons
│   └── ui/                 # Shadcn UI components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities & business logic
└── types/                  # TypeScript interfaces
```

## API Endpoints


| Method | Endpoint                                    | Description                    |
| ------ | ------------------------------------------- | ------------------------------ |
| GET    | `/api/customers`                            | List all customers (paginated) |
| GET    | `/api/metrics`                              | Dashboard metrics & analytics  |
| GET    | `/api/customers/segment?segment=High Value` | Filter by segment              |
| GET    | `/api/customers/churn?risk=High Risk`       | Filter by churn risk           |
| POST   | `/api/webhook`                              | Receive webhook events         |
| POST   | `/api/ai/chat`                              | AI analyst (streaming)         |
| POST   | `/api/ai/campaign`                          | Generate marketing campaigns   |


## CSV Format

Required columns for customer data upload:

```csv
customer_id,customer_name,email,orders,revenue,last_purchase_date
CUST-0001,John Smith,john@email.com,12,8500,2025-03-15
```

## Segmentation Rules


| Segment      | Criteria                 |
| ------------ | ------------------------ |
| High Value   | Revenue > $10,000        |
| Medium Value | Revenue $5,000 – $10,000 |
| Low Value    | Revenue < $5,000         |


## Churn Prediction


| Risk Level  | Criteria                    |
| ----------- | --------------------------- |
| High Risk   | Last purchase > 90 days ago |
| Medium Risk | Last purchase > 60 days ago |
| Low Risk    | Last purchase ≤ 60 days ago |


```bash
npm run build  # Verify production build locally
```

## License

MIT