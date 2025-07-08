// src/app/models/challenge.model.ts

export interface ChallengeBase {
  id: number;
  type: ChallengeType;
  question?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  animation?: string;
  testId?: string; // Pour les tests unitaires
}

export type ChallengeType =
  | 'image_selection'
  | 'multiple'
  | 'boolean';

export interface ImageSelectionChallenge extends ChallengeBase {
  type: 'image_selection';
  images: DetailsImg[];
}

export interface DetailsImg {
  url: string;
  alt: string;
  isCorrect: boolean;
}

// export interface TextInputChallenge extends ChallengeBase {
//   type: 'text_input';
//   answer: string;
//   placeholder?: string;
//   maxLength?: number;
// }

export interface MultipleChoiceChallenge extends ChallengeBase {
  type: 'multiple';
  correct_answer: string;
  incorrect_answers: string;
  category: string;
}


export interface TrueFalseChallenge extends ChallengeBase {
  type: 'boolean';
  correct_answer: string;
  incorrect_answers: string;
  category: string;
}

export type Challenge =
  | ImageSelectionChallenge
  | MultipleChoiceChallenge
  | TrueFalseChallenge;