import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTipSchema } from "@shared/schema";

const tipFormSchema = insertTipSchema.extend({
  amount: z.string().min(1).transform(Number),
  numEmployees: z.string().min(1).transform(Number),
});

type TipFormSchema = z.infer<typeof tipFormSchema>;

export default function TipEntry() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<TipFormSchema>({
    resolver: zodResolver(tipFormSchema),
    defaultValues: {
      amount: "0",
      numEmployees: "1",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: TipFormSchema) =>
      apiRequest("POST", "/api/tips", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
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
                      <Input {...field} type="number" step="0.01" min="0" />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="numEmployees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="1" />
                    </FormControl>
                  </FormItem>
                )}
              />
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