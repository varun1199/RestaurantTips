import { Tip, Employee } from "@shared/schema";
import { format, isWithinInterval, endOfDay, startOfDay } from "date-fns";

interface TipWithEmployees extends Tip {
  employees: (Employee & { amount: number })[];
}

function generateDailyReport(tips: TipWithEmployees[], startDate: Date, endDate: Date) {
  // Set start date to start of day and end date to end of day to include all records
  const startDateTime = startOfDay(startDate);
  const endDateTime = endOfDay(endDate);

  // Filter tips within the date range
  const filteredTips = tips.filter(tip => {
    const tipDate = new Date(tip.date);
    // Compare with the full day range
    return isWithinInterval(tipDate, { 
      start: startDateTime,
      end: endDateTime
    });
  });

  // Sort tips by date
  const sortedTips = filteredTips.sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Get all unique employee names
  const allEmployees = new Set<string>();
  sortedTips.forEach(tip => {
    tip.employees.forEach(emp => allEmployees.add(emp.name));
  });
  const employeeNames = Array.from(allEmployees).sort();

  // Calculate totals by employee
  const employeeTotals = new Map<string, number>();
  sortedTips.forEach(tip => {
    tip.employees.forEach(emp => {
      const currentTotal = employeeTotals.get(emp.name) || 0;
      employeeTotals.set(emp.name, currentTotal + Number(emp.amount));
    });
  });

  // Generate CSV rows
  const rows: string[][] = [];

  // Add title and date range
  rows.push([`Tip Report: ${format(startDate, "MMMM d, yyyy")} to ${format(endDate, "MMMM d, yyyy")}`]);
  rows.push([""]);

  // Add header row
  rows.push(["Date", "Day", ...employeeNames, "Daily Total"]);

  // Add data rows
  sortedTips.forEach(tip => {
    const tipDate = new Date(tip.date);
    const row = [
      format(tipDate, "MM/dd/yyyy"),
      format(tipDate, "EEEE"),
    ];

    // Add amount for each employee (or empty if they didn't work that day)
    employeeNames.forEach(empName => {
      const empTip = tip.employees.find(e => e.name === empName);
      row.push(empTip ? Number(empTip.amount).toFixed(2) : "");
    });

    // Add daily total
    const dailyTotal = Number(tip.amount);
    row.push(dailyTotal.toFixed(2));

    rows.push(row);
  });

  // Add empty row
  rows.push([""]);

  // Add employee totals row
  rows.push([
    "Period Totals",
    "",
    ...employeeNames.map(name => employeeTotals.get(name)?.toFixed(2) || "0.00"),
    sortedTips.reduce((sum, tip) => sum + Number(tip.amount), 0).toFixed(2)
  ]);

  return rows;
}

export function exportTipsToCSV(tips: TipWithEmployees[], startDate: Date, endDate: Date) {
  const rows = generateDailyReport(tips, startDate, endDate);
  const csvContent = rows.map(row => row.join(",")).join("\n");

  // Create and trigger download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `Yeti_Tips_Report_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}