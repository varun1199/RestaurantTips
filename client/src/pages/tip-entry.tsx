import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTipSchema, type Employee } from "@shared/schema";

type TipFormSchema = z.infer<typeof insertTipSchema>;

export default function TipEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    },
  });

  // Watch employee selections to update numEmployees
  const selectedEmployees = form.watch("employeeIds");
  if (selectedEmployees.length !== form.getValues("numEmployees")) {
    form.setValue("numEmployees", selectedEmployees.length);
  }

  const perEmployeeAmount = Number(form.watch("amount")) / selectedEmployees.length;

  const mutation = useMutation({
    mutationFn: (data: TipFormSchema) =>
      apiRequest("POST", "/api/tips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });

      // Show distribution details in success message
      const selectedEmployeeNames = employees
        .filter(emp => selectedEmployees.includes(emp.id))
        .map(emp => emp.name);

      toast({
        title: "Tips Recorded Successfully",
        description: (
          <div className="mt-2 space-y-2">
            <p>Total Amount: ${Number(form.getValues("amount")).toFixed(2)}</p>
            <p>Amount per Employee: ${perEmployeeAmount.toFixed(2)}</p>
            <p className="text-sm">Distribution for: {selectedEmployeeNames.join(", ")}</p>
          </div>
        ),
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

  return (
    <div className="max-w-md mx-auto">
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
                    Tips per employee: ${perEmployeeAmount.toFixed(2)}
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
    </div>
  );
}