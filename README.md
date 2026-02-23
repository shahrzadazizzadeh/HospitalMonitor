# Magnus EM — Environmental Monitoring Platform

AI-powered pharmaceutical environmental monitoring platform for cleanroom compliance management.

## Features

- **Data Upload** — Drag-and-drop Excel/CSV file import with flexible header mapping
- **Dashboard** — Real-time stats including:
  - Total Samples with type breakdown (Active Air, Surface, Personnel, etc.)
  - Compliance Rate (compliant samples / total samples)
  - Alert and Action event counts
  - CFU Trends chart by sample type
  - Microorganism Distribution chart
  - Excursion Events table (recent alerts and action exceedances)
- **Samples View** — Sortable, filterable table of all imported samples
- **Status Computation** — Automatic compliant/alert/action classification based on CFU vs limits

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Database:** SQLite via Prisma ORM + LibSQL
- **Charts:** Chart.js + react-chartjs-2
- **Styling:** Tailwind CSS 4

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/shahrzadazizzadeh/HospitalMonitor.git
   cd HospitalMonitor
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create the environment file**

   Create a file called `.env` in the project root:
   ```
   DATABASE_URL="file:./dev.db"
   ```

4. **Generate the Prisma client**
   ```bash
   npx prisma generate
   ```

5. **Create the database**
   ```bash
   npx prisma db push
   ```

6. **Start the app**
   ```bash
   npm run dev
   ```

7. **Open in browser**

   Go to [http://localhost:3000](http://localhost:3000)

## Usage

1. Click **Upload** in the navigation bar
2. Drag and drop an Excel (.xlsx/.xls) or CSV file
3. Go back to the **Dashboard** to see metrics and charts

### Required Excel Columns

| Column       | Accepted header names                          |
|-------------|------------------------------------------------|
| Sample Date  | `Sample_Date`, `Date`, `SampleDate`            |
| Location ID  | `Location_ID`, `LocationID`                    |
| Location Name| `Location_Name`, `LocationName`, `Location`    |
| Sample Type  | `Sample_Type`, `SampleType`, `Type`            |
| CFU Count    | `CFU_Count`, `CFUCount`, `CFU`                 |
| Action Limit | `Action_Limit`, `ActionLimit`                  |
| Alert Limit  | `Alert_Limit`, `AlertLimit`                    |
| Organism     | `Organism`, `Microorganism` *(optional)*       |

## Database Schema

- **Facility** — Hospital/manufacturing site
- **Location** — Monitoring points within a facility (with optional cleanroom grade)
- **Sample** — Individual EM readings with CFU counts and compliance status
- **Organism** — Identified microorganisms
- **Upload** — File import records
