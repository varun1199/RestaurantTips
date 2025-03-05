import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { exportTipsToCSV } from "@/lib/csv";
import { format } from "date-fns";
import type { Tip, Employee } from "@shared/schema";

interface TipWithEmployees extends Tip {
  employees: Employee[];
}

export default function Dashboard() {
  const { data: tips, isLoading } = useQuery<TipWithEmployees[]>({
    queryKey: ["/api/tips"],
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const chartData = tips?.map(tip => ({
    date: format(new Date(tip.date), "MMM d"),
    amount: Number(tip.amount),
    perEmployee: Number(tip.amount) / tip.employees.length
  }));

  const totalTips = tips?.reduce((sum, tip) => sum + Number(tip.amount), 0) || 0;
  const avgTipsPerDay = totalTips / (tips?.length || 1);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => tips && exportTipsToCSV(tips)}>
          Export to CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalTips.toFixed(2)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average Tips per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${avgTipsPerDay.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tips Over Time</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                name="Total Tips" 
              />
              <Line 
                type="monotone" 
                dataKey="perEmployee" 
                stroke="hsl(var(--secondary))" 
                name="Per Employee" 
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Tip Distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips?.slice(0, 5).map((tip) => (
              <div key={tip.id} className="border-b pb-4">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">
                    {format(new Date(tip.date), "EEEE, MMMM d, yyyy")}
                  </span>
                  <span className="font-bold">
                    Total: ${Number(tip.amount).toFixed(2)}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  <div>Per Employee: ${(Number(tip.amount) / tip.employees.length).toFixed(2)}</div>
                  <div className="mt-1">
                    Employees: {tip.employees.map(emp => emp.name).join(", ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}