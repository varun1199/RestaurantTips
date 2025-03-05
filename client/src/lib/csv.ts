import { Tip } from "@shared/schema";

export function exportTipsToCSV(tips: Tip[]) {
  const headers = ["Date", "Amount", "Number of Employees", "Per Employee"];
  const rows = tips.map(tip => [
    new Date(tip.date).toLocaleDateString(),
    tip.amount.toString(),
    tip.numEmployees.toString(),
    (Number(tip.amount) / Number(tip.numEmployees)).toFixed(2)
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.join(","))
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", `tips_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
