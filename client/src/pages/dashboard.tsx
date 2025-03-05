import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { exportTipsToCSV } from "@/lib/csv";
import { useState } from "react";
import type { Tip, Employee, UpdateTipDistribution } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface TipWithEmployees extends Tip {
  employeeDistribution: { employee: Employee; amount: string }[];
}

export default function Dashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTip, setSelectedTip] = useState<TipWithEmployees | null>(null);
  const [editedAmounts, setEditedAmounts] = useState<Record<number, number>>({});

  const { data: tips, isLoading } = useQuery<TipWithEmployees[]>({
    queryKey: ["/api/tips"],
  });

  const updateDistributionMutation = useMutation({
    mutationFn: async (data: { tipId: number; distribution: UpdateTipDistribution }) => {
      await apiRequest("PATCH", `/api/tips/${data.tipId}/distribution`, data.distribution);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tips"] });
      toast({
        title: "Success",
        description: "Tip distribution updated successfully",
      });
      setSelectedTip(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tip distribution",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const totalTips = tips?.reduce((sum, tip) => sum + Number(tip.amount), 0) || 0;
  const avgTipsPerDay = totalTips / (tips?.length || 1);

  const handleEditDistribution = (tip: TipWithEmployees) => {
    setSelectedTip(tip);
    setEditedAmounts(
      Object.fromEntries(
        tip.employeeDistribution.map(({ employee, amount }) => [employee.id, Number(amount)])
      )
    );
  };

  const handleSaveDistribution = () => {
    if (!selectedTip) return;

    // Validate that the total matches the original tip amount
    const totalEdited = Object.values(editedAmounts).reduce((sum, amount) => sum + amount, 0);
    const originalTotal = Number(selectedTip.amount);

    if (Math.abs(totalEdited - originalTotal) > 0.01) { // Allow for small rounding differences
      toast({
        title: "Error",
        description: "The total amount must match the original tip amount.",
        variant: "destructive",
      });
      return;
    }

    const distribution: UpdateTipDistribution = {
      employeeAmounts: Object.entries(editedAmounts).map(([employeeId, amount]) => ({
        employeeId: Number(employeeId),
        amount: Number(amount),
      })),
    };

    updateDistributionMutation.mutate({
      tipId: selectedTip.id,
      distribution,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={() => tips && exportTipsToCSV(tips)}>
          Export to CSV
        </Button>
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
          <CardTitle>Daily Tip Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tips?.map((tip) => (
              <Card key={tip.id} className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-semibold">
                      {new Date(tip.date).toLocaleDateString()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Total: ${Number(tip.amount).toFixed(2)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleEditDistribution(tip)}
                  >
                    Edit Distribution
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {tip.employeeDistribution.map(({ employee, amount }) => (
                    <div key={employee.id} className="p-2 border rounded">
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${Number(amount).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedTip} onOpenChange={(open) => !open && setSelectedTip(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tip Distribution</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedTip?.employeeDistribution.map(({ employee, amount }) => (
              <div key={employee.id} className="flex items-center gap-4">
                <label className="w-1/2">{employee.name}</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editedAmounts[employee.id] || Number(amount)}
                  onChange={(e) =>
                    setEditedAmounts({
                      ...editedAmounts,
                      [employee.id]: Number(e.target.value),
                    })
                  }
                />
              </div>
            ))}
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setSelectedTip(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveDistribution}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}