# Manager Report — Data Requirements

Hi Josh,

To build the full Manager Report feature, we need some additional data. Here's what we need and why.

---

## 1. Extra Columns in the Excel File

Please add these 5 columns to the EM data spreadsheet:

| # | Column Name | Example Values | Why We Need It |
|---|------------|----------------|----------------|
| 1 | **Grade** | A, B, C, D | Grade Performance Analysis — compliance and CFU trends by cleanroom grade |
| 2 | **Shift** | Morning, Afternoon, Night | Shift Analysis — compare compliance across shifts |
| 3 | **Gram_Type** | Gram-positive, Gram-negative, Fungi | Microbiology section — contamination source breakdown |
| 4 | **Risk_Level** | Low, Medium, High | Microbiology section — objectionable organism alerts |
| 5 | **Contamination_Source** | Personnel, Environmental, Fungi, Water | Microbiology section — source distribution chart |

### Updated Excel Header Row Example

```
Sample_Date | Location_ID | Location_Name | Sample_Type | CFU_Count | Action_Limit | Alert_Limit | Organism | Grade | Shift | Gram_Type | Risk_Level | Contamination_Source
```

---

## 2. Additional Information (not in the Excel)

These are things we'll need to know for each reporting period, but they don't go in the sample data file:

| # | Item | Example | Used In |
|---|------|---------|---------|
| 6 | **Batch Count** | 47 batches produced in Q3 2024 | KPI dashboard + batch release statement |
| 7 | **Critical Issues / CAPAs** | Open investigations, remediation actions, deadlines, owners | Critical Issues banner + Recommendations page |
| 8 | **Report Approvers** | Names and titles of people who sign off (e.g. QC Microbiologist, QA Manager, Qualified Person) | Signature block on the final page |

---

## What We Can Build Right Now (Without the Above)

With the current Meir Hospital data, we can already build:
- Executive Overview (KPIs, monthly trends, sample type breakdown)
- Location Performance Analysis (compliance by location, underperformers)
- Partial Microbiology (top organisms chart, but no gram/source/risk breakdown)
- Executive Conclusion (auto-generated summary + signature block template)

Once you provide the extra columns, we'll add:
- Grade Performance Analysis (Page 2)
- Full Microbiology Analysis (Page 4)
- Shift & Sample Type Analysis (Page 5)
- Complete Recommendations (Page 6)

---

## Questions?

Let us know if any of the columns are unclear or if you'd prefer different column names. The system is flexible with header naming — for example, "Grade" or "Cleanroom_Grade" or "Room_Grade" would all work.
