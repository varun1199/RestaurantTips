import { Tip, Employee } from "@shared/schema";
import { format } from "date-fns";

interface TipWithEmployees extends Tip {
  employees: (Employee & { amount: number })[];
}

export function exportTipsToCSV(tips: TipWithEmployees[]) {
  const headers = ["Date", "Day", "Total Amount", "Employee Name", "Employee Amount"];

  const rows: string[][] = [];
  tips.forEach(tip => {
    // Sort employees by name for consistency
    const sortedEmployees = [...tip.employees].sort((a, b) => a.name.localeCompare(b.name));

    // Add a row for each employee
    sortedEmployees.forEach((emp, idx) => {
      const row = [
        format(new Date(tip.date), "MM/dd/yyyy"),
        format(new Date(tip.date), "EEEE"),
        // Only include total amount in first row for this tip
        idx === 0 ? Number(tip.amount).toFixed(2) : "",
        emp.name,
        emp.amount.toFixed(2)
      ];
      rows.push(row);
    });

    // Add an empty row between different tips for better readability
    rows.push(Array(headers.length).fill(""));
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `tips_${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}