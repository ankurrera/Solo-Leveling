import { useState } from "react";
import { useCharacteristics } from "@/hooks/useCharacteristics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";
import { CHARACTERISTIC_ICONS } from "@/lib/skillsConstants";

interface CreateCharacteristicFormProps {
  onClose: () => void;
}

const CreateCharacteristicForm = ({ onClose }: CreateCharacteristicFormProps) => {
  const { createCharacteristic } = useCharacteristics();
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(CHARACTERISTIC_ICONS[0]);
  const [xp, setXP] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createCharacteristic.mutate(
      {
        name: name.trim(),
        icon,
        xp: parseInt(xp) || 0,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="system-panel p-4 space-y-4 border-2 border-primary/20">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-normal text-foreground">
          New Characteristic
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon Selection */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Icon
          </label>
          <div className="grid grid-cols-5 gap-2">
            {CHARACTERISTIC_ICONS.map((iconOption) => (
              <button
                key={iconOption}
                type="button"
                onClick={() => setIcon(iconOption)}
                className={`
                  p-2 text-xl rounded border transition-all
                  ${
                    icon === iconOption
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted hover:border-primary/50"
                  }
                `}
              >
                {iconOption}
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Name
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Strength, Intelligence, Agility"
            className="bg-input border-border"
            required
          />
        </div>

        {/* Initial XP */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Initial XP
          </label>
          <Input
            type="number"
            value={xp}
            onChange={(e) => setXP(e.target.value)}
            placeholder="0"
            className="bg-input border-border"
            min="0"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1 border-border hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!name.trim() || createCharacteristic.isPending}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {createCharacteristic.isPending ? "Creating..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateCharacteristicForm;
