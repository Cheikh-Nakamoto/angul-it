// src/app/models/challenge.model.ts

export interface ChallengeBase {
  id?: number;
  type?: ChallengeType;
  question?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  animation?: string;
  isSuccess?:boolean
  testId?: string; // Pour les tests unitaires
}

export type ChallengeType =
  | 'image_selection'
  | 'multiple'
  | 'boolean';

export interface ImageSelectionChallenge extends ChallengeBase {
  type?: 'image_selection';
  images?: DetailsImg[];
  correctPos?:number[]
}

export interface DetailsImg {
  url?: string;
  alt?: string;
  isCorrect?: boolean;
  item?:string
}

// export interface TextInputChallenge extends ChallengeBase {
//   type: 'text_input';
//   answer: string;
//   placeholder?: string;
//   maxLength?: number;
// }

export interface MultipleChoiceChallenge extends ChallengeBase {
  type: 'multiple'| 'boolean';
  correct_answer: string;
  incorrect_answers: string[];
  category: string;
}

export type Challenge =
  | ImageSelectionChallenge
  | MultipleChoiceChallenge;


export interface ChallengeResult {
  challenge: Challenge;
  timeSpent: number;
  score: number;
  attempts: number;
  isSuccess: boolean;
}

export interface GlobalStats {
  globalScore: number;
  totalTime: string;
  successfulChallenges: number;
  perfectStreak: number;
  totalChallenges: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
}