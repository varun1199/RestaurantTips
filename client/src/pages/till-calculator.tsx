import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertTillSchema } from "@shared/schema";

const denominations = {
  nickels: 0.05,
  dimes: 0.10,
  quarters: 0.25,
  ones: 1,
  fives: 5,
  tens: 10,
  twenties: 20,
  fifties: 50,
  hundreds: 100,
};

export default function TillCalculator() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof insertTillSchema>>({
    resolver: zodResolver(insertTillSchema),
    defaultValues: Object.fromEntries(
      Object.keys(denominations).map(key => [key, "0"])
    ),
  });

  const total = Object.entries(form.watch()).reduce((sum, [key, value]) => {
    return sum + (Number(value) || 0) * denominations[key as keyof typeof denominations];
  }, 0);

  const mutation = useMutation({
    mutationFn: (data: z.infer<typeof insertTillSchema>) =>
      apiRequest("POST", "/api/tills", { ...data, total }),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Till calculation saved",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save till calculation",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Till Calculator</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(denominations).map(([key, value]) => (
                  <FormField
                    key={key}
                    control={form.control}
                    name={key as keyof typeof denominations}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>${value.toFixed(2)}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" min="0" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              <div className="text-2xl font-bold text-center my-6">
                Total: ${total.toFixed(2)}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? "Saving..." : "Save Till Count"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}