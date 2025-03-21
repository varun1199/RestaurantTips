import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { QRCodeSVG } from 'qrcode.react';
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
  securityAnswer: z.string().min(1, "Security answer is required"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isRecoveryDialogOpen, setIsRecoveryDialogOpen] = useState(false);
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);

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
      securityAnswer: "",
      newPassword: "",
      confirmNewPassword: "",
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error("Failed to reset password");
      }

      toast({
        title: "Success",
        description: "Password has been reset successfully. You can now log in with your new password.",
      });
      setIsRecoveryDialogOpen(false);
      recoveryForm.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset password. Please verify your information and try again.",
        variant: "destructive",
      });
    }
  }

  async function fetchSecurityQuestion(employeeId: string) {
    try {
      const response = await fetch(`/api/auth/security-question/${employeeId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch security question");
      }
      const data = await response.json();
      setSecurityQuestion(data.securityQuestion);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch security question. Please verify your Employee ID.",
        variant: "destructive",
      });
    }
  }

  const currentUrl = window.location.origin;

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              Scan to open on your phone
            </p>
            <div className="bg-white p-4 rounded-lg">
              <QRCodeSVG value={currentUrl} size={150} />
            </div>
          </div>
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
                          <div className="flex gap-2">
                            <Input {...field} placeholder="Enter your Employee ID" />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => fetchSecurityQuestion(field.value)}
                              disabled={!field.value}
                            >
                              Find
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  {securityQuestion && (
                    <>
                      <div className="text-sm">
                        <p className="font-medium">Security Question:</p>
                        <p className="mt-1">{securityQuestion}</p>
                      </div>
                      <FormField
                        control={recoveryForm.control}
                        name="securityAnswer"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Security Answer</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Enter your answer" />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={recoveryForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={recoveryForm.control}
                        name="confirmNewPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!securityQuestion}
                  >
                    Reset Password
                  </Button>
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