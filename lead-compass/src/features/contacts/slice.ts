import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Contact, ContactState, UpdateContact } from "@/features/contacts/contact.types";
import { contactApis } from "@/features/contacts/contact.service";
import type { RootState } from "@/store";

const initialState: ContactState = {
  contacts: [],
  contactDetail: null,
  loading: false,
  error: null,
  success: false,
};

export const fetchContacts = createAsyncThunk("contacts/fetch", async (search?: string) =>
  (await contactApis.list(search)).data
);

export const fetchContact = createAsyncThunk("contacts/fetchOne", async (id: string) =>
  (await contactApis.getById(id)).data
);

export const updateContact = createAsyncThunk(
  "contacts/update",
  async ({ id, changes }: { id: string; changes: UpdateContact }) =>
    (await contactApis.update(id, changes)).data
);

export const deleteContact = createAsyncThunk("contacts/delete", async (id: string) => {
  await contactApis.remove(id);
  return id;
});


const slice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    clearContactDetail(state) {
      state.contactDetail = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(fetchContacts.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchContacts.fulfilled, (s, a) => {
      s.loading = false;
      s.contacts = a.payload;
    });
    b.addCase(fetchContacts.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || "Could not load contacts";
    });

    b.addCase(fetchContact.pending, (s) => {
      s.loading = true;
      s.error = null;
    });
    b.addCase(fetchContact.fulfilled, (s, a) => {
      s.loading = false;
      s.contactDetail = a.payload;
    });
    b.addCase(fetchContact.rejected, (s, a) => {
      s.loading = false;
      s.error = a.error.message || "Could not load contact";
    });

    b.addCase(updateContact.fulfilled, (s, a: PayloadAction<Contact>) => {
      s.success = true;
      s.contactDetail = a.payload;
      const idx = s.contacts.findIndex((c) => c.id === a.payload.id);
      if (idx !== -1) s.contacts[idx] = a.payload;
    });

    b.addCase(deleteContact.fulfilled, (s, a) => {
      s.contacts = s.contacts.filter((c) => c.id !== a.payload);
      if (s.contactDetail?.id === a.payload) s.contactDetail = null;
    });
  },
});

export const { clearContactDetail } = slice.actions;
export default slice.reducer;

export const selectContacts = (state: RootState) => state.contacts.contacts;
export const selectContactDetail = (state: RootState) => state.contacts.contactDetail;
export const selectContactsLoading = (state: RootState) => state.contacts.loading;
export const selectContactsError = (state: RootState) => state.contacts.error;