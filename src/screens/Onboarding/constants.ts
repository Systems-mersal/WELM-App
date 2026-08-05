import step1Image from "../../assets/figma/onboarding/step1.png";
import step2Image from "../../assets/figma/onboarding/step2.png";
import step3Image from "../../assets/figma/onboarding/step3.png";

export const STEPS = [
  {
    key: "step1",
    titleKey: "step1.title",
    descKey: "step1.desc",
    image: step1Image,
  },
  {
    key: "step2",
    titleKey: "step2.title",
    descKey: "step2.desc",
    image: step2Image,
  },
  {
    key: "step3",
    titleKey: "step3.title",
    descKey: "step3.desc",
    image: step3Image,
  },
] as const;

export const LAST_STEP_INDEX = STEPS.length - 1;
