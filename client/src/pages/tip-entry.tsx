import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTipSchema, type Employee, type Tip } from "@shared/schema";
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
} from "@/components/ui/dialog";
import { Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type TipFormSchema = z.infer<typeof insertTipSchema>;

interface TipDistribution {
  employeeId: number;
  employeeName: string;
  amount: number;
}

interface TipWithEmployees extends Tip {
  employees: (Employee & { amount: number })[];
}

export default function TipEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tipDistributions, setTipDistributions] = useState<TipDistribution[]>([]);
  const [editingTip, setEditingTip] = useState<TipWithEmployees | null>(null);
  const [editDistributions, setEditDistributions] = useState<TipDistribution[]>([]);
  const [tipToDelete, setTipToDelete] = useState<TipWithEmployees | null>(null);

  // Fetch employees and tips
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: tips = [] } = useQuery<TipWithEmployees[]>({
    queryKey: ["/api/tips"],
  });

  const form = useForm<TipFormSchema>({
    resolver: zodResolver(insertTipSchema),
    defaultValues: {
      amount: 0,
      numEmployees: 1,
      employeeIds: [],
      date: format(new Date(), "yyyy-MM-dd"),
      distributions: [],
    },
  });

  const editForm = useForm<TipFormSchema>({
    resolver: zodResolver(insertTipSchema),
  });

  // Watch employee selections to update numEmployees
  const selectedEmployees = form.watch("employeeIds");
  useEffect(() => {
    if (selectedEmployees.length !== form.getValues("numEmployees")) {
      form.setValue("numEmployees", selectedEmployees.length);
    }
  }, [selectedEmployees, form]);

  const totalAmount = Number(form.watch("amount"));
  const selectedDate = parseISO(form.watch("date"));
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

  // Watch edit form values for distribution updates
  const editSelectedEmployees = editForm.watch("employeeIds") || [];
  const editAmount = Number(editForm.watch("amount")) || 0;

  useEffect(() => {
    if (editSelectedEmployees.length > 0 && editAmount > 0) {
      const perEmployee = editAmount / editSelectedEmployees.length;
      const distributions = editSelectedEmployees.map(empId => {
        const employee = employees.find(e => e.id === empId);
        return {
          employeeId: empId,
          employeeName: employee?.name || '',
          amount: perEmployee
        };
      });
      setEditDistributions(distributions);
      editForm.setValue("distributions", distributions);
      editForm.setValue("numEmployees", editSelectedEmployees.length);
    }
  }, [editSelectedEmployees, editAmount, employees, editForm]);

  const formattedDate = format(selectedDate, "EEEE, MMMM d, yyyy");

  const createMutation = useMutation({
    mutationFn: (data: TipFormSchema) => {
      const formattedData = {
        ...data,
        date: data.date,
        distributions: tipDistributions.map(dist => ({
          employeeId: dist.employeeId,
          employeeName: dist.employeeName,
          amount: Number(dist.amount)
        }))
      };
      return apiRequest("POST", "/api/tips", formattedData);
    },
    onSuccess: () => {
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

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; tip: TipFormSchema }) =>
      apiRequest("PATCH", `/api/tips/${data.id}`, data.tip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      toast({
        title: "Success",
        description: "Tip record updated successfully",
      });
      setEditingTip(null);
      setEditDistributions([]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tip record",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (tip: TipWithEmployees) => {
    setEditingTip(tip);
    const tipDate = new Date(tip.date);

    editForm.reset({
      date: format(tipDate, "yyyy-MM-dd"),
      amount: Number(tip.amount),
      numEmployees: Number(tip.numEmployees),
      employeeIds: tip.employees.map(emp => emp.id),
      distributions: tip.employees.map(emp => ({
        employeeId: emp.id,
        employeeName: emp.name,
        amount: Number(emp.amount)
      }))
    });

    setEditDistributions(tip.employees.map(emp => ({
      employeeId: emp.id,
      employeeName: emp.name,
      amount: Number(emp.amount)
    })));
  };

  // Add delete mutation
  const deleteMutation = useMutation({
    mutationFn: (tipId: number) =>
      apiRequest("DELETE", `/api/tips/${tipId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      toast({
        title: "Success",
        description: "Tip record deleted successfully",
      });
      setTipToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete tip record",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Record Daily Tips - {formattedDate}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
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
                            checked={field.value?.includes(employee.id)}
                            onCheckedChange={(checked) => {
                              const current = field.value || [];
                              const updated = checked
                                ? [...current, employee.id]
                                : current.filter((id) => id !== employee.id);
                              field.onChange(updated);
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
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Recording..." : "Record Tips"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Previous Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Previous Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips.map((tip) => (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setTipToDelete(tip)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
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
                        value={field.value}
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
                              const current = field.value || [];
                              const updated = checked
                                ? [...current, employee.id]
                                : current.filter((id) => id !== employee.id);
                              field.onChange(updated);
                            }}
                          />
                        </FormControl>
                        <span>{employee.name}</span>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {editDistributions.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-2">Updated Distribution Preview</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {editDistributions.map((dist) => (
                        <TableRow key={dist.employeeId}>
                          <TableCell>{dist.employeeName}</TableCell>
                          <TableCell className="text-right">${dist.amount.toFixed(2)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={tipToDelete !== null} onOpenChange={(open) => !open && setTipToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the tip record from {tipToDelete && format(new Date(tipToDelete.date), "MMMM d, yyyy")}
              {tipToDelete && ` with total amount $${Number(tipToDelete.amount).toFixed(2)}`}.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => tipToDelete && deleteMutation.mutate(tipToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}