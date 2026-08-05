import { Alert } from "react-native";
import i18n from "../i18n";

/** Shared stub for unfinished actions (social login, upload, etc.). */
export function alertComingSoon() {
  Alert.alert(i18n.t("common:a11y.coming-soon"));
}
