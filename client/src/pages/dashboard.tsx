import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { exportTipsToCSV } from "@/lib/csv";
import { format, subDays } from "date-fns";
import type { Tip, Employee } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

interface TipWithEmployees extends Tip {
  employees: (Employee & { amount: number })[];
}

const dateRangeSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
});

export default function Dashboard() {
  const { data: tips, isLoading } = useQuery<TipWithEmployees[]>({
    queryKey: ["/api/tips"],
  });

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  const exportForm = useForm<z.infer<typeof dateRangeSchema>>({
    resolver: zodResolver(dateRangeSchema),
    defaultValues: {
      startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const handleExport = (values: z.infer<typeof dateRangeSchema>) => {
    if (!tips) return;

    const startDate = new Date(values.startDate);
    const endDate = new Date(values.endDate);
    endDate.setHours(23, 59, 59, 999); // Include the entire end date

    exportTipsToCSV(tips, startDate, endDate);
    setIsExportDialogOpen(false);
  };

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
        <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
          <DialogTrigger asChild>
            <Button>Export to CSV</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Select Date Range for Export</DialogTitle>
            </DialogHeader>
            <Form {...exportForm}>
              <form onSubmit={exportForm.handleSubmit(handleExport)} className="space-y-4">
                <FormField
                  control={exportForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={exportForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">Export</Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
                <div className="flex justify-between items-center mb-2">
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