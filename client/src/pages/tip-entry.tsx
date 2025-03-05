import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTipSchema, type Employee, type UpdateTipDistribution } from "@shared/schema";
import { useAuth } from "@/lib/auth";
import { useState } from "react";

type TipFormSchema = z.infer<typeof insertTipSchema>;

interface TipWithEmployees {
  id: number;
  date: string;
  amount: string;
  numEmployees: number;
  employeeDistribution: { employee: Employee; amount: string }[];
}

export default function TipEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedTip, setSelectedTip] = useState<TipWithEmployees | null>(null);
  const [editedAmount, setEditedAmount] = useState<number>(0);

  // Fetch employees
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  // Fetch today's tips
  const { data: todayTips = [] } = useQuery<TipWithEmployees[]>({
    queryKey: ["/api/tips/today"],
  });

  const form = useForm<TipFormSchema>({
    resolver: zodResolver(insertTipSchema),
    defaultValues: {
      amount: 0,
      numEmployees: 1,
      employeeIds: [],
    },
  });

  // Watch employee selections to update numEmployees
  const selectedEmployees = form.watch("employeeIds");
  if (selectedEmployees.length !== form.getValues("numEmployees")) {
    form.setValue("numEmployees", selectedEmployees.length);
  }

  const mutation = useMutation({
    mutationFn: (data: TipFormSchema) =>
      apiRequest("POST", "/api/tips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tips/today"] });
      toast({
        title: "Success",
        description: "Tips have been recorded",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record tips",
        variant: "destructive",
      });
    },
  });

  const updateDistributionMutation = useMutation({
    mutationFn: async (data: { tipId: number; distribution: UpdateTipDistribution }) => {
      await apiRequest("PATCH", `/api/tips/${data.tipId}/distribution`, data.distribution);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      queryClient.invalidateQueries({ queryKey: ["/api/tips/today"] });
      toast({
        title: "Success",
        description: "Tip amount updated successfully",
      });
      setSelectedTip(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tip amount",
        variant: "destructive",
      });
    },
  });

  const handleEditAmount = (tip: TipWithEmployees, currentAmount: string) => {
    setSelectedTip(tip);
    setEditedAmount(Number(currentAmount));
  };

  const handleSaveAmount = () => {
    if (!selectedTip || !user) return;

    const distribution: UpdateTipDistribution = {
      employeeAmounts: selectedTip.employeeDistribution.map(({ employee, amount }) => ({
        employeeId: employee.id,
        amount: employee.id === Number(user.employeeId) ? editedAmount : Number(amount),
      })),
    };

    updateDistributionMutation.mutate({
      tipId: selectedTip.id,
      distribution,
    });
  };

  return (
    <div className="space-y-6">
      {user?.isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>Record Daily Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                className="space-y-4"
              >
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
                      render={({field}) => (
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

                <div className="text-sm text-muted-foreground text-center">
                  {selectedEmployees.length} employees selected
                  {selectedEmployees.length > 0 && (
                    <div className="mt-1">
                      Tips per employee: ${(Number(form.getValues("amount")) / selectedEmployees.length).toFixed(2)}
                    </div>
                  )}
                </div>

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
      )}

      {/* Today's Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayTips.map((tip) => (
              <Card key={tip.id} className="p-4">
                <div className="text-sm text-muted-foreground mb-4">
                  Total: ${Number(tip.amount).toFixed(2)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {tip.employeeDistribution.map(({ employee, amount }) => {
                    const isCurrentEmployee = user?.employeeId === String(employee.id);
                    return (
                      <div key={employee.id} className="p-2 border rounded">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-muted-foreground">
                          ${Number(amount).toFixed(2)}
                          {isCurrentEmployee && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="ml-2"
                              onClick={() => handleEditAmount(tip, amount)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Amount Dialog */}
      <Dialog open={!!selectedTip} onOpenChange={(open) => !open && setSelectedTip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Your Tip Amount</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
              <label className="w-1/2">Your Amount</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={editedAmount}
                onChange={(e) => setEditedAmount(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSelectedTip(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveAmount}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}