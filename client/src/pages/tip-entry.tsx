import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTipSchema, type Employee } from "@shared/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, CheckCircle } from "lucide-react";
import { useState, useEffect, ReactNode } from "react";
import { CheckCircle2 } from "lucide-react";

type TipFormSchema = z.infer<typeof insertTipSchema>;

interface TipDistribution {
  employeeId: number;
  employeeName: string;
  amount: number;
}

export default function TipEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tipDistributions, setTipDistributions] = useState<TipDistribution[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<TipDistribution | null>(null);

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const form = useForm<TipFormSchema>({
    resolver: zodResolver(insertTipSchema),
    defaultValues: {
      amount: 0,
      numEmployees: 1,
      employeeIds: [],
      date: format(new Date(), "yyyy-MM-dd"),
      distributions: [], // Initialize distributions
    },
  });

  // Watch employee selections to update numEmployees
  const selectedEmployees = form.watch("employeeIds");
  useEffect(() => {
    if (selectedEmployees.length !== form.getValues("numEmployees")) {
      form.setValue("numEmployees", selectedEmployees.length);
    }
  }, [selectedEmployees, form]);

  const totalAmount = Number(form.watch("amount"));
  const selectedDate = new Date(form.watch("date"));
  const perEmployeeAmount = selectedEmployees.length > 0 ? totalAmount / selectedEmployees.length : 0;

  // Update distributions when amount or selected employees change
  const updateDistributions = () => {
    const distributions = selectedEmployees.map(empId => {
      const employee = employees.find(e => e.id === empId);
      return {
        employeeId: empId,
        employeeName: employee?.name || '',
        amount: perEmployeeAmount
      };
    });
    setTipDistributions(distributions);
  };

  useEffect(() => {
    updateDistributions();
  }, [totalAmount, selectedEmployees.length, employees]);

  const handleEditAmount = (distribution: TipDistribution) => {
    setEditingEmployee(distribution);
  };

  const handleSaveEdit = (newAmount: number) => {
    if (!editingEmployee) return;

    const newDistributions = tipDistributions.map(dist =>
      dist.employeeId === editingEmployee.employeeId
        ? { ...dist, amount: newAmount }
        : dist
    );
    setTipDistributions(newDistributions);
    setEditingEmployee(null);
  };

  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");

  const mutation = useMutation({
    mutationFn: (data: TipFormSchema) => {
      // Ensure proper formatting of the data
      const formattedData = {
        ...data,
        // Ensure date is properly formatted with time set to noon to avoid timezone issues
        date: `${data.date}T12:00:00.000Z`,
        distributions: tipDistributions.map(dist => ({
          employeeId: dist.employeeId,
          employeeName: dist.employeeName,
          amount: Number(dist.amount)
        }))
      };
      console.log("Submitting tip data:", formattedData);
      return apiRequest("POST", "/api/tips", formattedData);
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });

      toast({
        title: (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Tips Successfully Recorded!</span>
          </div>
        ),
        description: (
          <div className="mt-2">
            <div className="text-sm font-medium mb-2">
              <div>Date: {formattedDate}</div>
              <div>Total Amount: ${totalAmount.toFixed(2)}</div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tipDistributions.map((dist) => (
                  <TableRow key={dist.employeeId}>
                    <TableCell>{dist.employeeName}</TableCell>
                    <TableCell className="text-right">${dist.amount.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-2 text-sm text-muted-foreground text-center">
              Distribution recorded at {format(new Date(), "h:mm a")}
            </div>
          </div>
        ),
        duration: 5000,
      });

      form.reset();
      setTipDistributions([]);
    },
    onError: () => {
      toast({
        title: (
          <div className="flex items-center gap-2 text-destructive">
            <span>Error Recording Tips</span>
          </div>
        ),
        description: "Failed to record tips. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Record Daily Tips - {formattedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Total Tips ($)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <FormLabel>Select Working Employees</FormLabel>
                {employees.map((employee) => (
                  <FormField
                    key={employee.id}
                    control={form.control}
                    name="employeeIds"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={selectedEmployees.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues("employeeIds");
                              const updated = checked
                                ? [...current, employee.id]
                                : current.filter((id) => id !== employee.id);
                              form.setValue("employeeIds", updated);
                            }}
                          />
                        </FormControl>
                        <span>{employee.name}</span>
                      </FormItem>
                    )}
                  />
                ))}
                <FormMessage>{form.formState.errors.employeeIds?.message}</FormMessage>
              </div>

              {tipDistributions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Tip Distribution Preview</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tipDistributions.map((dist) => (
                        <TableRow key={dist.employeeId}>
                          <TableCell>{dist.employeeName}</TableCell>
                          <TableCell className="text-right">${dist.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditAmount(dist)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Edit Tip Amount for {dist.employeeName}</DialogTitle>
                                </DialogHeader>
                                <div className="py-4">
                                  <FormItem>
                                    <FormLabel>Amount ($)</FormLabel>
                                    <FormControl>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        defaultValue={dist.amount}
                                        onChange={(e) => handleSaveEdit(Number(e.target.value))}
                                      />
                                    </FormControl>
                                  </FormItem>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Recording..." : "Record Tips"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}