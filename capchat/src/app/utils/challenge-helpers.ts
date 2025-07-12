import { Injectable } from '@angular/core';
import { Challenge, ImageSelectionChallenge } from '../models/models';
import { ChallengeService } from '../services/challenge';

@Injectable({
  providedIn: 'root'
})
export class ChallengeHelpers {
  constructor(private challengeService: ChallengeService) {}

  getMaxSelections(challenge: Challenge): number {
    if (challenge.type === 'image_selection' && challenge.correctPos) {
      return challenge.correctPos.length;
    }
    return 9; // Valeur par défaut
  }

  getAnswerOptions(challenge: Challenge): string[] {
    if (challenge.type === 'multiple') {
      return (challenge.incorrect_answers);
    } else if (challenge.type === 'boolean') {
      return ['Vrai', 'Faux'];
    }
    return [];
  }

 

  getImageTarget(challenge: Challenge): string {
    if (challenge.type === 'image_selection') {
      return this.challengeService.searchItem;
    }
    return '';
  }

  canVerify(selectedAnswer: string | number | (string | number)[] | null, selectedImageCount: number, challenge: Challenge): boolean {
    const maxSelections = this.getMaxSelections(challenge);
    if (challenge.type === 'image_selection') {
      return selectedImageCount > 0 && selectedImageCount <= maxSelections;
    } else {
      return selectedAnswer !== null;
    }
  }

  getQuestionText(challenge: Challenge): string {
    return challenge.question || 'Question non disponible';
  }

  getCategoryText(challenge: Challenge): string {
    if (challenge.type === 'multiple' || challenge.type === 'boolean') {
      return challenge.category || 'Général';
    }
    return 'Images';
  }

  getDifficultyText(challenge: Challenge): string {
    return challenge.difficulty || 'medium';
  }
}