"use client";

import { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Contact, ContactInput } from "@/entities";

interface ContactFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ContactInput) => Promise<void> | void;
  initialValues?: Contact;
}

const EMPTY: ContactInput = {
  fullName: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  tags: [],
};

export function ContactFormDialog({
  open,
  onClose,
  onSubmit,
  initialValues,
}: ContactFormDialogProps) {
  const [values, setValues] = useState<ContactInput>(initialValues ?? EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field: keyof ContactInput, value: string) =>
    setValues((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(values);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={initialValues ? "Edit contact" : "New contact"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          placeholder="Full name"
          value={values.fullName}
          onChange={(e) => update("fullName", e.target.value)}
          required
        />
        <Input
          type="email"
          placeholder="Email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          required
        />
        <Input
          placeholder="Phone"
          value={values.phone ?? ""}
          onChange={(e) => update("phone", e.target.value)}
        />
        <Input
          placeholder="Company"
          value={values.company ?? ""}
          onChange={(e) => update("company", e.target.value)}
        />
        <Input
          placeholder="Job title"
          value={values.jobTitle ?? ""}
          onChange={(e) => update("jobTitle", e.target.value)}
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save contact"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
