export type StepPropsType = {
  translation: string;
  onClickNext: () => void;
  image?: string;
  alt?: string;
  final?: boolean;
};

export type OnboardingPropsType = {
  steps: string[];
};
