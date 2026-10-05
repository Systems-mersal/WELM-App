import type { NavigationProp } from "@react-navigation/native";

import type { RootStackParamList } from "../../../navigation/types";
import { startWelmEmailOtp } from "../api/welm-auth";
import { WelmAuthApiError } from "../api/types";

/**
 * Email + password account whose email is not verified yet: send the code and
 * open Otp. Back from Otp returns to Login, never to the signup form.
 */
export async function routeToEmailOtp(
  navigation: NavigationProp<RootStackParamList>,
  email: string,
): Promise<void> {
  let params: RootStackParamList["Otp"] = { email, intent: "signup" };

  try {
    const started = await startWelmEmailOtp(email);
    params = {
      email: started.email,
      intent: "signup",
      debugCode: started.debugCode,
      resendIn: started.resendInSeconds,
    };
  } catch (error) {
    const cooldown =
      error instanceof WelmAuthApiError &&
      error.serverCode === "resend_cooldown";
    params = {
      email,
      intent: "signup",
      resendIn: cooldown ? error.retryAfterSeconds : 0,
      sendFailed: !cooldown,
    };
  }

  navigation.reset({
    index: 1,
    routes: [{ name: "Login" }, { name: "Otp", params }],
  });
}
