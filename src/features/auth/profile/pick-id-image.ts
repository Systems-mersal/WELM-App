/**
 * Load expo-image-picker only when the user picks an image.
 * A top-level import calls requireNativeModule during bundle eval and
 * crashes the app with "Cannot find native module 'ExponentImagePicker'"
 * while the Expo runtime is still starting.
 */
async function loadImagePicker() {
  return import("expo-image-picker");
}

export type PickIdImageResult =
  | { ok: true; uri: string }
  | { ok: false; reason: "denied" | "canceled" | "unavailable" };

function isNativePickerMissing(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return (
    /ExponentImagePicker|Cannot find native module|undefined is not a function/i.test(
      message,
    )
  );
}

export async function pickIdImageFromLibrary(): Promise<PickIdImageResult> {
  try {
    const ImagePicker = await loadImagePicker();
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      return { ok: false, reason: "denied" };
    }
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.85,
    });
    if (picked.canceled || !picked.assets[0]?.uri) {
      return { ok: false, reason: "canceled" };
    }
    return { ok: true, uri: picked.assets[0].uri };
  } catch (error) {
    if (isNativePickerMissing(error)) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }
}

export async function pickIdImageFromCamera(): Promise<PickIdImageResult> {
  try {
    const ImagePicker = await loadImagePicker();
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      return { ok: false, reason: "denied" };
    }
    const shot = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (shot.canceled || !shot.assets[0]?.uri) {
      return { ok: false, reason: "canceled" };
    }
    return { ok: true, uri: shot.assets[0].uri };
  } catch (error) {
    if (isNativePickerMissing(error)) {
      return { ok: false, reason: "unavailable" };
    }
    throw error;
  }
}
