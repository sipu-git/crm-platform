import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const emptyForm = {
  invoice_number: "", contact_name: "", contact_email: "", company: "",
  status: "Draft", issue_date: "", due_date: "", tax_rate: 0, notes: "",
  line_items: [{ description: "", quantity: 1, unit_price: 0 }],
};

export default function InvoiceFormDialog({ open, onOpenChange, invoice, onSaved }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const isEdit = !!invoice;

  useEffect(() => {
    if (invoice) {
      setForm({
        invoice_number: invoice.invoice_number || "",
        contact_name: invoice.contact_name || "",
        contact_email: invoice.contact_email || "",
        company: invoice.company || "",
        status: invoice.status || "Draft",
        issue_date: invoice.issue_date || "",
        due_date: invoice.due_date || "",
        tax_rate: invoice.tax_rate || 0,
        notes: invoice.notes || "",
        line_items: invoice.line_items?.length ? invoice.line_items : [{ description: "", quantity: 1, unit_price: 0 }],
      });
    } else {
      const num = `INV-${Date.now().toString().slice(-6)}`;
      setForm({ ...emptyForm, invoice_number: num });
    }
  }, [invoice, open]);

  const subtotal = form.line_items.reduce((s, i) => s + (i.quantity || 0) * (i.unit_price || 0), 0);
  const taxAmount = subtotal * (form.tax_rate || 0) / 100;
  const total = subtotal + taxAmount;

  const updateItem = (idx, field, value) => {
    setForm(f => ({
      ...f,
      line_items: f.line_items.map((item, i) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  const addItem = () => setForm(f => ({ ...f, line_items: [...f.line_items, { description: "", quantity: 1, unit_price: 0 }] }));
  const removeItem = (idx) => setForm(f => ({ ...f, line_items: f.line_items.filter((_, i) => i !== idx) }));

  const handleSave = async () => {
    setSaving(true);
    const data = { ...form, subtotal, tax_amount: taxAmount, total };
    if (isEdit) {
      await base44.entities.Invoice.update(invoice.id, data);
    } else {
      await base44.entities.Invoice.create(data);
    }
    setSaving(false);
    onSaved?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Invoice" : "New Invoice"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Invoice Number</Label>
            <Input value={form.invoice_number} onChange={e => setForm(f => ({ ...f, invoice_number: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Draft", "Sent", "Paid", "Overdue", "Cancelled"].map(s => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contact Name *</Label>
            <Input value={form.contact_name} onChange={e => setForm(f => ({ ...f, contact_name: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Contact Email</Label>
            <Input type="email" value={form.contact_email} onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Issue Date</Label>
            <Input type="date" value={form.issue_date} onChange={e => setForm(f => ({ ...f, issue_date: e.target.value }))} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Due Date</Label>
            <Input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
          </div>
        </div>

        {/* Line Items */}
        <div className="mt-4">
          <Label className="text-xs">Line Items</Label>
          <div className="mt-2 space-y-2">
            {form.line_items.map((item, idx) => (
              <div key={idx} className="flex gap-2 items-end">
                <Input
                  placeholder="Description"
                  value={item.description}
                  onChange={e => updateItem(idx, "description", e.target.value)}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={e => updateItem(idx, "quantity", Number(e.target.value))}
                  className="w-20"
                />
                <Input
                  type="number"
                  placeholder="Price"
                  value={item.unit_price}
                  onChange={e => updateItem(idx, "unit_price", Number(e.target.value))}
                  className="w-28"
                />
                <span className="text-sm font-medium w-24 text-right text-slate-700 pb-2">
                  ${((item.quantity || 0) * (item.unit_price || 0)).toLocaleString()}
                </span>
                {form.line_items.length > 1 && (
                  <Button size="icon" variant="ghost" className="h-9 w-9 text-red-400" onClick={() => removeItem(idx)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" onClick={addItem} className="mt-2 gap-1 text-xs">
            <Plus className="w-3 h-3" /> Add Line
          </Button>
        </div>

        {/* Totals */}
        <div className="mt-4 bg-slate-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span className="font-medium">${subtotal.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Tax</span>
              <Input
                type="number"
                value={form.tax_rate}
                onChange={e => setForm(f => ({ ...f, tax_rate: Number(e.target.value) }))}
                className="w-16 h-7 text-xs"
              />
              <span className="text-slate-400">%</span>
            </div>
            <span className="font-medium">${taxAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-base font-bold border-t pt-2">
            <span>Total</span>
            <span>${total.toLocaleString()}</span>
          </div>
        </div>

        <div className="col-span-2 space-y-1.5 mt-2">
          <Label className="text-xs">Notes</Label>
          <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={!form.contact_name || saving}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {saving ? "Saving…" : isEdit ? "Update" : "Create"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}