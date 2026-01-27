import { useState } from "react";
import { Skill, useSkills } from "@/hooks/useSkills";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface EditSkillDialogProps {
  skill: Skill;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditSkillDialog = ({ skill, open, onOpenChange }: EditSkillDialogProps) => {
  const { updateSkill } = useSkills();
  const [name, setName] = useState(skill.name);
  const [description, setDescription] = useState(skill.description || "");
  const [area, setArea] = useState(skill.area || "");
  const [coverImage, setCoverImage] = useState(skill.cover_image || "");
  const [xp, setXP] = useState(skill.xp.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateSkill.mutate(
      {
        id: skill.id,
        name: name.trim(),
        description: description.trim() || null,
        area: area.trim() || null,
        cover_image: coverImage.trim() || null,
        xp: parseInt(xp) || 0,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="system-panel max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-normal text-foreground">
            Edit Skill
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                Skill Name *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Skill name"
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
                placeholder="Area or category"
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
              placeholder="Brief description..."
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

            {/* XP */}
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-2 block">
                XP
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
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!name.trim() || updateSkill.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {updateSkill.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditSkillDialog;
