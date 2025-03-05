import { Tip, Employee } from "@shared/schema";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface TipWithEmployees extends Tip {
  employees: (Employee & { amount: number })[];
}

interface WeeklyTotal {
  employeeName: string;
  total: number;
  numberOfShifts: number;
}

interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  employeeTotals: WeeklyTotal[];
}

function generateWeeklyReports(tips: TipWithEmployees[]): WeeklyReport[] {
  // Group tips by week
  const weeklyTips = new Map<string, TipWithEmployees[]>();

  tips.forEach(tip => {
    const tipDate = new Date(tip.date);
    const weekStart = startOfWeek(tipDate, { weekStartsOn: 1 }); // Start week on Monday
    const weekKey = format(weekStart, "yyyy-MM-dd");

    if (!weeklyTips.has(weekKey)) {
      weeklyTips.set(weekKey, []);
    }
    weeklyTips.get(weekKey)!.push(tip);
  });

  // Calculate totals for each week
  return Array.from(weeklyTips.entries()).map(([weekKey, weekTips]) => {
    const weekStart = new Date(weekKey);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    // Calculate totals for each employee
    const employeeTotalsMap = new Map<string, WeeklyTotal>();

    weekTips.forEach(tip => {
      tip.employees.forEach(emp => {
        const current = employeeTotalsMap.get(emp.name) || {
          employeeName: emp.name,
          total: 0,
          numberOfShifts: 0
        };
        current.total += Number(emp.amount);
        current.numberOfShifts += 1;
        employeeTotalsMap.set(emp.name, current);
      });
    });

    // Convert to array and sort by employee name
    const employeeTotals = Array.from(employeeTotalsMap.values())
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    return {
      weekStart,
      weekEnd,
      employeeTotals
    };
  }).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime()); // Most recent first
}

export function exportTipsToCSV(tips: TipWithEmployees[]) {
  const weeklyReports = generateWeeklyReports(tips);

  const headers = [
    "Week Starting",
    "Week Ending",
    "Employee Name",
    "Total Tips",
    "Number of Shifts",
    "Average per Shift"
  ];

  const rows: string[][] = [];
  weeklyReports.forEach(report => {
    // Add week header
    rows.push([
      format(report.weekStart, "MM/dd/yyyy"),
      format(report.weekEnd, "MM/dd/yyyy"),
      "",
      "",
      "",
      ""
    ]);

    // Add employee rows
    report.employeeTotals.forEach(empTotal => {
      rows.push([
        "",
        "",
        empTotal.employeeName,
        empTotal.total.toFixed(2),
        empTotal.numberOfShifts.toString(),
        (empTotal.total / empTotal.numberOfShifts).toFixed(2)
      ]);
    });

    // Add empty row between weeks
    rows.push(Array(headers.length).fill(""));
  });

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `weekly_tips_${format(new Date(), "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}