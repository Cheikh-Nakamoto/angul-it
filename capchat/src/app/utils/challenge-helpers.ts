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
    if (challenge.type === 'multiple' || challenge.type === 'boolean') {
      return (challenge.incorrect_answers);
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

  /**
   * Récupère le prochain ID basé sur la challengesList du localStorage
   * @returns Le prochain ID disponible (plus grand ID + 1) ou 1 si aucun challenge trouvé
   */
  getNextChallengeId(): number {
    // Récupérer la challengesList depuis le localStorage
    const challengeListJson = localStorage.getItem('old');
    
    // Si rien dans le localStorage, retourner 1
    if (!challengeListJson) {
      return 1;
    }
    
    let challengeList: Challenge[] = [];
    try {
      challengeList = JSON.parse(challengeListJson);
    } catch (error) {
      console.error('Erreur lors du parsing de challengesList:', error);
      return 1;
    }
    
    return challengeList.length + 1;
  }

}