// features/contacts/pages/ContactsPage.tsx
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Mail, Phone, Trash2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { deleteContact, fetchContacts } from "@/features/contacts/slice";
import { PageHeader, EmptyState, TableSkeleton } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { formatFullName } from "@/hooks/use-format";

export function ContactsPage() {
  const dispatch = useAppDispatch();
  const contacts = useAppSelector((state) => state.contacts.contacts);
  const loading = useAppSelector((state) => state.contacts.loading);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchContacts());
  }, [dispatch]);

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    try {
      await dispatch(deleteContact(pendingDeleteId)).unwrap();
      toast.success("Contact removed");
    } catch (error) {
      toast.error(typeof error === "string" ? error : "Failed to remove contact");
    } finally {
      setPendingDeleteId(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Contacts"
        description="People and customer relationships in your workspace."
      />

      <div className="p-6">
        {loading && !contacts.length && <TableSkeleton />}

        {!loading && !contacts.length && (
          <EmptyState
            title="No contacts yet"
            description="Contacts are created automatically when a lead comes in."
          />
        )}

        {!!contacts.length && (
          <div className="overflow-hidden rounded-md border bg-card">
            <div className="overflow-x-auto scroller-hide rounded-lg border bg-card">
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 font-medium">Name</th>
                    <th className="px-3 py-2 font-medium">Designation</th>
                    <th className="px-3 py-2 font-medium">Email</th>
                    <th className="px-3 py-2 font-medium">Phone</th>
                    <th className="px-3 py-2 font-medium">Leads</th>
                    <th className="px-3 py-2 font-medium" >Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {contacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-muted/40">
                      <td className="px-3 py-3 font-medium">
                        {formatFullName(contact.first_name, contact.last_name)}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {contact.designation || "—"}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {contact.email ? (
                          <span className="inline-flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5" />
                            {contact.email}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">
                        {contact.phone ? (
                          <span className="inline-flex items-center gap-1">
                            <Phone className="h-3.5 w-3.5" />
                            {contact.phone}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-3">
                        {contact._count?.leads ?? 0}
                      </td>
                      <td className="px-3 py-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => setPendingDeleteId(contact.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this contact?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the contact record. Any linked leads or deals will keep their history but lose this reference.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete contact</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}