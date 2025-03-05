import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { exportTipsToCSV } from "@/lib/csv";
import { format, subDays } from "date-fns";
import type { Tip, Employee, InsertTip } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTipSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Edit2 } from "lucide-react";

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
  const [editingTip, setEditingTip] = useState<TipWithEmployees | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const exportForm = useForm<z.infer<typeof dateRangeSchema>>({
    resolver: zodResolver(dateRangeSchema),
    defaultValues: {
      startDate: format(subDays(new Date(), 7), "yyyy-MM-dd"),
      endDate: format(new Date(), "yyyy-MM-dd"),
    },
  });

  const editForm = useForm<z.infer<typeof insertTipSchema>>({
    resolver: zodResolver(insertTipSchema),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; tip: z.infer<typeof insertTipSchema> }) =>
      apiRequest("PATCH", `/api/tips/${data.id}`, data.tip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      toast({
        title: "Success",
        description: "Tip record updated successfully",
      });
      setEditingTip(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tip record",
        variant: "destructive",
      });
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

  const handleEdit = (tip: TipWithEmployees) => {
    setEditingTip(tip);
    editForm.reset({
      date: format(new Date(tip.date), "yyyy-MM-dd"),
      amount: Number(tip.amount),
      numEmployees: Number(tip.numEmployees),
      employeeIds: tip.employees.map(emp => emp.id),
      distributions: tip.employees.map(emp => ({
        employeeId: emp.id,
        employeeName: emp.name,
        amount: Number(emp.amount)
      }))
    });
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
      {/* Export Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
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

      {/* Edit Dialog */}
      <Dialog open={editingTip !== null} onOpenChange={(open) => !open && setEditingTip(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Tip Record</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit((data) =>
                editingTip && updateMutation.mutate({ id: editingTip.id, tip: data })
              )}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Tips ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Select Working Employees</FormLabel>
                {employees.map((employee) => (
                  <FormField
                    key={employee.id}
                    control={editForm.control}
                    name="employeeIds"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              const current = editForm.getValues("employeeIds");
                              const updated = checked
                                ? [...current, employee.id]
                                : current.filter((id) => id !== employee.id);
                              editForm.setValue("employeeIds", updated);

                              // Update distributions when employees change
                              const totalAmount = editForm.getValues("amount");
                              const perEmployee = totalAmount / updated.length;
                              const distributions = updated.map(empId => {
                                const emp = employees.find(e => e.id === empId);
                                return {
                                  employeeId: empId,
                                  employeeName: emp?.name || '',
                                  amount: perEmployee
                                };
                              });
                              editForm.setValue("distributions", distributions);
                              editForm.setValue("numEmployees", updated.length);
                            }}
                          />
                        </FormControl>
                        <span>{employee.name}</span>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={updateMutation.isPending}
              >
                {updateMutation.isPending ? "Updating..." : "Update Tip Record"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <DialogTrigger asChild onClick={() => setIsExportDialogOpen(true)}>
          <Button>Export to CSV</Button>
        </DialogTrigger>
      </div>

      {/* Rest of the dashboard UI */}
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
                  <div className="flex items-center gap-2">
                    <span className="font-bold">
                      Total: ${Number(tip.amount).toFixed(2)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(tip)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
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