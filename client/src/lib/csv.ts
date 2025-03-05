import { Tip, Employee } from "@shared/schema";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface TipWithEmployees extends Tip {
  employees: (Employee & { amount: number })[];
}

interface DailyTotal {
  date: Date;
  totalAmount: number;
  employeeAmounts: {
    employeeName: string;
    amount: number;
  }[];
}

interface WeeklyReport {
  weekStart: Date;
  weekEnd: Date;
  dailyTotals: DailyTotal[];
  employeeWeeklyTotals: {
    employeeName: string;
    weeklyTotal: number;
    numberOfShifts: number;
  }[];
}

function generateWeeklyReports(tips: TipWithEmployees[], startDate: Date, endDate: Date): WeeklyReport[] {
  // Filter tips within the date range
  const filteredTips = tips.filter(tip => {
    const tipDate = new Date(tip.date);
    return isWithinInterval(tipDate, { start: startDate, end: endDate });
  });

  // Group tips by week
  const weeklyTips = new Map<string, TipWithEmployees[]>();

  filteredTips.forEach(tip => {
    const tipDate = new Date(tip.date);
    const weekStart = startOfWeek(tipDate, { weekStartsOn: 1 }); // Start week on Monday
    const weekKey = format(weekStart, "yyyy-MM-dd");

    if (!weeklyTips.has(weekKey)) {
      weeklyTips.set(weekKey, []);
    }
    weeklyTips.get(weekKey)!.push(tip);
  });

  // Process each week
  return Array.from(weeklyTips.entries()).map(([weekKey, weekTips]) => {
    const weekStart = new Date(weekKey);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });

    // Sort tips by date and create daily totals
    const dailyTotals = weekTips
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(tip => ({
        date: new Date(tip.date),
        totalAmount: Number(tip.amount),
        employeeAmounts: tip.employees
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(emp => ({
            employeeName: emp.name,
            amount: Number(emp.amount)
          }))
      }));

    // Calculate weekly totals for each employee
    const employeeTotalsMap = new Map<string, { total: number; shifts: number }>();
    dailyTotals.forEach(day => {
      day.employeeAmounts.forEach(({ employeeName, amount }) => {
        const current = employeeTotalsMap.get(employeeName) || { total: 0, shifts: 0 };
        current.total += amount;
        current.shifts += 1;
        employeeTotalsMap.set(employeeName, current);
      });
    });

    const employeeWeeklyTotals = Array.from(employeeTotalsMap.entries())
      .map(([employeeName, { total, shifts }]) => ({
        employeeName,
        weeklyTotal: total,
        numberOfShifts: shifts
      }))
      .sort((a, b) => a.employeeName.localeCompare(b.employeeName));

    return {
      weekStart,
      weekEnd,
      dailyTotals,
      employeeWeeklyTotals
    };
  }).sort((a, b) => b.weekStart.getTime() - a.weekStart.getTime()); // Most recent first
}

export function exportTipsToCSV(tips: TipWithEmployees[], startDate: Date, endDate: Date) {
  const weeklyReports = generateWeeklyReports(tips, startDate, endDate);

  const rows: string[][] = [];

  // Calculate period totals for all employees
  const periodTotalsMap = new Map<string, { total: number; shifts: number }>();
  weeklyReports.forEach(report => {
    report.employeeWeeklyTotals.forEach(emp => {
      const current = periodTotalsMap.get(emp.employeeName) || { total: 0, shifts: 0 };
      current.total += emp.weeklyTotal;
      current.shifts += emp.numberOfShifts;
      periodTotalsMap.set(emp.employeeName, current);
    });
  });

  // Add report title and date range
  rows.push([`Tip Report: ${format(startDate, "MMMM d, yyyy")} to ${format(endDate, "MMMM d, yyyy")}`]);
  rows.push([""]);

  // Add daily details for each week
  weeklyReports.forEach(report => {
    // Add week header
    rows.push([`Week of ${format(report.weekStart, "MMM d")} - ${format(report.weekEnd, "MMM d, yyyy")}`]);
    rows.push([""]);

    // Add daily totals header
    rows.push([
      "Date",
      "Day",
      "Daily Total",
      "Employee Name",
      "Employee Amount"
    ]);

    // Add daily details
    report.dailyTotals.forEach(day => {
      day.employeeAmounts.forEach((emp, index) => {
        rows.push([
          index === 0 ? format(day.date, "MM/dd/yyyy") : "",
          index === 0 ? format(day.date, "EEEE") : "",
          index === 0 ? day.totalAmount.toFixed(2) : "",
          emp.employeeName,
          emp.amount.toFixed(2)
        ]);
      });
      rows.push([""]); // Space between days
    });

    // Add weekly summary
    rows.push(["Weekly Summary"]);
    report.employeeWeeklyTotals.forEach(emp => {
      rows.push([
        "",
        "",
        "",
        emp.employeeName,
        emp.weeklyTotal.toFixed(2)
      ]);
    });

    const weekTotal = report.employeeWeeklyTotals.reduce((sum, emp) => sum + emp.weeklyTotal, 0);
    rows.push(["", "", "", "Week Total", weekTotal.toFixed(2)]);
    rows.push([""]); // Space between weeks
    rows.push([""]);
  });

  // Add period totals
  rows.push(["Period Summary"]);
  rows.push(["Employee Name", "Total Tips", "Total Shifts", "Average per Shift"]);

  Array.from(periodTotalsMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([employeeName, { total, shifts }]) => {
      rows.push([
        employeeName,
        total.toFixed(2),
        shifts.toString(),
        (total / shifts).toFixed(2)
      ]);
    });

  const periodTotal = Array.from(periodTotalsMap.values())
    .reduce((sum, { total }) => sum + total, 0);
  rows.push([""]);
  rows.push(["Period Total", periodTotal.toFixed(2)]);

  const csvContent = rows.map(row => row.join(",")).join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `tips_report_${format(startDate, "yyyy-MM-dd")}_to_${format(endDate, "yyyy-MM-dd")}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}