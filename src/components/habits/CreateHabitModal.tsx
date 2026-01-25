import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateHabitModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CreateHabitModal = ({ open, onOpenChange }: CreateHabitModalProps) => {
  const [habitName, setHabitName] = useState("");
  const [habitIcon, setHabitIcon] = useState("📚");
  const [habitColor, setHabitColor] = useState("purple");
  const [winXP, setWinXP] = useState(100);
  const [loseXP, setLoseXP] = useState(50);
  const [duration, setDuration] = useState(30);

  const colorOptions = [
    { name: "purple", value: "#a855f7", label: "Purple" },
    { name: "green", value: "#22c55e", label: "Green" },
    { name: "gold", value: "#eab308", label: "Gold" },
    { name: "orange", value: "#f97316", label: "Orange" },
  ];

  const iconOptions = ["📚", "🌿", "💡", "💪", "🎯", "⚡", "🔥", "⭐"];

  const handleCreate = () => {
    // Handle habit creation logic here
    console.log({
      habitName,
      habitIcon,
      habitColor,
      winXP,
      loseXP,
      duration,
    });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setHabitName("");
    setHabitIcon("📚");
    setHabitColor("purple");
    setWinXP(100);
    setLoseXP(50);
    setDuration(30);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="system-panel max-w-md border-primary/30">
        <DialogHeader>
          <DialogTitle className="text-2xl font-gothic text-foreground">
            Create New Habit
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Habit Name */}
          <div className="space-y-2">
            <Label htmlFor="habitName" className="text-sm font-medium text-foreground">
              Habit Name
            </Label>
            <Input
              id="habitName"
              value={habitName}
              onChange={(e) => setHabitName(e.target.value)}
              placeholder="Enter habit name..."
              className="bg-input border-border text-foreground"
            />
          </div>

          {/* Habit Icon */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Habit Icon</Label>
            <div className="flex gap-2 flex-wrap">
              {iconOptions.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setHabitIcon(icon)}
                  className={`text-2xl w-12 h-12 rounded-lg flex items-center justify-center transition-all ${
                    habitIcon === icon
                      ? "bg-primary/20 border-2 border-primary scale-110"
                      : "bg-card/50 border border-border hover:border-primary/50"
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Color */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Habit Color</Label>
            <div className="flex gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.name}
                  onClick={() => setHabitColor(color.name)}
                  className={`w-12 h-12 rounded-lg transition-all ${
                    habitColor === color.name
                      ? "scale-110 ring-2 ring-offset-2 ring-offset-background"
                      : "hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: color.value,
                    boxShadow: habitColor === color.name ? `0 0 20px ${color.value}80` : "none",
                  }}
                  title={color.label}
                />
              ))}
            </div>
          </div>

          {/* XP Rewards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="winXP" className="text-sm font-medium text-foreground">
                Win XP
              </Label>
              <Input
                id="winXP"
                type="number"
                value={winXP}
                onChange={(e) => setWinXP(Number(e.target.value))}
                className="bg-input border-border text-foreground"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loseXP" className="text-sm font-medium text-foreground">
                Lose XP
              </Label>
              <Input
                id="loseXP"
                type="number"
                value={loseXP}
                onChange={(e) => setLoseXP(Number(e.target.value))}
                className="bg-input border-border text-foreground"
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium text-foreground">
              Duration (Days)
            </Label>
            <Input
              id="duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="bg-input border-border text-foreground"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-border/50">
          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="flex-1 border-border hover:bg-card/50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            className="flex-1 bg-primary hover:bg-primary/90 hover-glow"
            disabled={!habitName}
          >
            Create Habit
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateHabitModal;
