import { useState } from "react";
import { useSkills } from "@/hooks/useSkills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

interface CreateSkillFormProps {
  onClose: () => void;
}

const CreateSkillForm = ({ onClose }: CreateSkillFormProps) => {
  const { createSkill } = useSkills();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [area, setArea] = useState("");
  const [coverImage, setCoverImage] = useState("");
  const [xp, setXP] = useState("0");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    createSkill.mutate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        area: area.trim() || undefined,
        cover_image: coverImage.trim() || undefined,
        xp: parseInt(xp) || 0,
        is_active: true,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  return (
    <div className="system-panel p-6 border-2 border-primary/20">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-normal text-foreground">
          New Skill
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Skill Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Web Development, Guitar Playing"
              className="bg-input border-border"
              required
            />
          </div>

          {/* Area */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Area / Category
            </label>
            <Input
              value={area}
              onChange={(e) => setArea(e.target.value)}
              placeholder="e.g., Programming, Music, Fitness"
              className="bg-input border-border"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this skill..."
            className="bg-input border-border resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Cover Image URL */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
              Cover Image URL
            </label>
            <Input
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="bg-input border-border"
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
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
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
            disabled={!name.trim() || createSkill.isPending}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {createSkill.isPending ? "Creating..." : "Create Skill"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateSkillForm;
