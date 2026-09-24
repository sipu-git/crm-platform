import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormAlert, useFormAlert } from '@/components/ui/form-alert';
import { useProjectMutation } from '@/features/projects/hooks/useProjects';
import type { CreateProjectPayload } from '@/features/projects/types/projects.types';

interface ProjectFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectFormModal({ open, onOpenChange }: ProjectFormModalProps) {
  const { create } = useProjectMutation();
  const { alert, showError, showSuccess, dismiss } = useFormAlert();

  const [formData, setFormData] = useState<CreateProjectPayload>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dismiss();
    create.mutate(formData, {
      onSuccess: () => {
        showSuccess('Project created successfully');
        onOpenChange(false);
      },
      onError: (error: any) => {
        const msg = error?.message ?? 'Failed to create project';
        showError(msg);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto p-0">
        <DialogHeader className="shrink-0 border-b border-border/40 px-6 py-5 bg-[#1A1F2B]/90">
          <DialogTitle className="text-lg">Add Project / Enquiry</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5 bg-[#1A1F2B]/90">
          {alert && <FormAlert alert={alert} onDismiss={dismiss} />}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Name</label>
                <Input name="project_name" placeholder="Enter project name" required onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Project Type</label>
                <Input name="project_type" placeholder="e.g. Website Design" onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Company Name</label>
            <Input name="company_name" placeholder="Enter company name" onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
             <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">First Name</label>
                <Input name="first_name" placeholder="Contact first name" required onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
            </div>
             <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Last Name</label>
                <Input name="last_name" placeholder="Contact last name" required onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
            </div>
          </div>
          <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Email</label>
              <Input name="contact_email" type="email" placeholder="Contact email" required onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
          </div>
          <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Phone</label>
              <Input name="contact_phone" placeholder="Contact phone" onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Timeline</label>
                 <Input name="timeline" placeholder="e.g. 3 Months" onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground">Budget</label>
                 <Input name="budget" type="number" placeholder="Enter budget" onChange={handleChange} className="bg-background/50 border-border/50 focus:border-primary/50" />
              </div>
          </div>
          <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <Textarea name="description" placeholder="Project description" className="min-h-[80px] bg-background/50 border-border/50 focus:border-primary/50" onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40 mt-6">
            <Button variant="outline" type="button" onClick={() => onOpenChange(false)} className="border-border/50 hover:bg-background/50">
              Cancel
            </Button>
            <Button type="submit" disabled={create.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
              {create.isPending ? 'Creating…' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

