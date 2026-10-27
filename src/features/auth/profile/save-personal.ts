import { queryClient } from "../../../lib/query-client";
import {
  useAuthStore,
  type PendingPersonalSave,
} from "../../../stores/auth-store";
import { COMPANY_VEHICLES_QUERY_KEY } from "../../vehicles/hooks/use-company-vehicles";
import {
  patchWelmPersonalDetails,
  startWelmEmailOtp,
  startWelmPhoneOtp,
  uploadWelmAvatar,
  type WelmEmailStartResponse,
  type WelmPhoneStartResponse,
} from "../api";

export type PersonalDetailsDraft = {
  name: string;
  email: string;
  phone: string;
  companyId?: string;
  companyName?: string;
  photoUri: string | null;
};

export type PersonalSaveStart =
  | { status: "saved" }
  | {
      status: "verify-email";
      email: string;
      debugCode?: string;
      resendIn?: number;
      sendFailed?: boolean;
    }
  | { status: "verify-phone"; phone: string; debugCode?: string };

function emailsEqual(left: string | undefined, right: string): boolean {
  return (left ?? "").trim().toLowerCase() === right.trim().toLowerCase();
}

function phonesEqual(left: string | undefined, right: string): boolean {
  return (left ?? "").replace(/\s+/g, "") === right.replace(/\s+/g, "");
}

function toPending(
  draft: PersonalDetailsDraft,
  awaitEmail: boolean,
  awaitPhone: boolean,
): PendingPersonalSave {
  return {
    ...draft,
    awaitEmail,
    awaitPhone,
  };
}

async function persistPersonalDetails(
  draft: PersonalDetailsDraft,
): Promise<void> {
  let avatarUrl: string | undefined;
  if (draft.photoUri) {
    avatarUrl = await uploadWelmAvatar(draft.photoUri);
  }

  const saved = await patchWelmPersonalDetails({
    ...(draft.companyId ? { companyId: draft.companyId } : {}),
    name: draft.name,
    email: draft.email,
    phone: draft.phone,
    avatarUrl,
  });

  useAuthStore.getState().updateUser({
    name: saved.user.name || draft.name,
    firstName: saved.user.firstName || draft.name.trim().split(/\s+/)[0],
    email: saved.user.email ?? draft.email,
    phone: saved.user.phone ?? draft.phone,
    avatarUrl: saved.user.avatarUrl ?? avatarUrl,
    companyId: saved.user.companyId ?? draft.companyId,
    companyName: saved.user.companyName ?? draft.companyName,
    customerId: saved.customerId,
  });
  useAuthStore.getState().setPendingPersonalSave(null);
  await queryClient.invalidateQueries({ queryKey: COMPANY_VEHICLES_QUERY_KEY });
}

export async function submitPersonalDetails(
  draft: PersonalDetailsDraft,
): Promise<PersonalSaveStart> {
  const user = useAuthStore.getState().user;
  const emailChanged = !emailsEqual(user?.email, draft.email);
  const phoneChanged = !phonesEqual(user?.phone, draft.phone);

  if (emailChanged) {
    useAuthStore
      .getState()
      .setPendingPersonalSave(toPending(draft, true, phoneChanged));
    try {
      const started: WelmEmailStartResponse = await startWelmEmailOtp(
        draft.email,
      );
      return {
        status: "verify-email",
        email: started.email,
        debugCode: started.debugCode,
        resendIn: started.resendInSeconds,
      };
    } catch (error) {
      useAuthStore.getState().setPendingPersonalSave(null);
      throw error;
    }
  }

  if (phoneChanged) {
    useAuthStore
      .getState()
      .setPendingPersonalSave(toPending(draft, false, true));
    try {
      const started: WelmPhoneStartResponse = await startWelmPhoneOtp(
        draft.phone,
      );
      return {
        status: "verify-phone",
        phone: started.phone,
      };
    } catch (error) {
      useAuthStore.getState().setPendingPersonalSave(null);
      throw error;
    }
  }

  await persistPersonalDetails(draft);
  return { status: "saved" };
}

export async function continuePersonalDetailsAfterVerify(
  kind: "email" | "phone",
): Promise<PersonalSaveStart> {
  const pending = useAuthStore.getState().pendingPersonalSave;
  if (!pending) {
    return { status: "saved" };
  }

  const next: PendingPersonalSave = {
    ...pending,
    awaitEmail: kind === "email" ? false : pending.awaitEmail,
    awaitPhone: kind === "phone" ? false : pending.awaitPhone,
  };
  useAuthStore.getState().setPendingPersonalSave(next);

  if (next.awaitEmail) {
    const started = await startWelmEmailOtp(next.email);
    return {
      status: "verify-email",
      email: started.email,
      debugCode: started.debugCode,
      resendIn: started.resendInSeconds,
    };
  }

  if (next.awaitPhone) {
    const started = await startWelmPhoneOtp(next.phone);
    return {
      status: "verify-phone",
      phone: started.phone,
    };
  }

  await persistPersonalDetails(next);
  return { status: "saved" };
}
