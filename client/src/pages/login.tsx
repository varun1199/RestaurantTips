import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const recoverySchema = z.object({
  employeeId: z.string().min(1, "Employee ID is required"),
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const recoveryForm = useForm<z.infer<typeof recoverySchema>>({
    resolver: zodResolver(recoverySchema),
    defaultValues: {
      employeeId: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    try {
      const user = await login(values.username, values.password);
      setLocation(user.isAdmin ? "/dashboard" : "/tip-entry");
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
    }
  }

  async function onRecoverySubmit(values: z.infer<typeof recoverySchema>) {
    try {
      const response = await fetch("/api/auth/request-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to submit recovery request");
      }

      toast({
        title: "Success",
        description: "Your request has been submitted. Please contact your administrator for assistance.",
      });
      setIsRecoveryDialogOpen(false);
      recoveryForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit recovery request. Please try again later.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Dialog open={isRecoveryDialogOpen} onOpenChange={setIsRecoveryDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-sm text-muted-foreground">
                Forgot Username or Password?
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Account Recovery</DialogTitle>
              </DialogHeader>
              <Form {...recoveryForm}>
                <form onSubmit={recoveryForm.handleSubmit(onRecoverySubmit)} className="space-y-4">
                  <FormField
                    control={recoveryForm.control}
                    name="employeeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Employee ID</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Enter your Employee ID" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Submit Recovery Request
                  </Button>
                  <p className="text-sm text-muted-foreground text-center">
                    After submitting, please contact your administrator for assistance with resetting your credentials.
                  </p>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <p className="text-sm text-muted-foreground">
            New employee?{" "}
            <Link href="/register">
              <a className="text-primary hover:underline">Register here</a>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}