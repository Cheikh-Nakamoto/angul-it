import { Challenge, ChallengeType } from '../models/models';

export function sameElementsSorted<T>(arr1: T[], arr2: T[]): boolean {
    if (arr1.length !== arr2.length) return false;
    
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    
    return JSON.stringify(sorted1) === JSON.stringify(sorted2);
}


/**
 * Utilitaires pour les calculs de résultats
 */
export class ResultUtils {
  
  /**
   * Calcule le score global basé sur les résultats des défis
   */
  static calculateGlobalScore(challenges: Challenge[]): number {
    if (challenges.length === 0) return 0;
    
    let totalScore = 0;
    let validChallenges = 0;
    
    challenges.forEach(challenge => {
      const score = this.calculateChallengeScore(challenge);
      totalScore += score;
      validChallenges++;
    });
    
    return validChallenges > 0 ? Math.round(totalScore / validChallenges) : 0;
  }

  /**
   * Calcule le score d'un défi individuel
   */
  static calculateChallengeScore(challenge: Challenge): number {
    if (challenge.isSuccess) {
      // Score de base pour un défi réussi
      let baseScore = 100;
      
      // Bonus/malus selon la difficulté
      switch (challenge.difficulty) {
        case 'easy':
          baseScore = 90;
          break;
        case 'medium':
          baseScore = 95;
          break;
        case 'hard':
          baseScore = 100;
          break;
      }
      
      // Petite variation aléatoire pour simuler des nuances
      const variation = Math.floor(Math.random() * 10) - 5;
      return Math.max(85, Math.min(100, baseScore + variation));
    }
    
    // Score d'échec basé sur la difficulté
    switch (challenge.difficulty) {
      case 'easy':
        return Math.floor(Math.random() * 20) + 40; // 40-60%
      case 'medium':
        return Math.floor(Math.random() * 15) + 30; // 30-45%
      case 'hard':
        return Math.floor(Math.random() * 10) + 20; // 20-30%
      default:
        return Math.floor(Math.random() * 20) + 30; // 30-50%
    }
  }

  /**
   * Calcule le temps total formaté
   */
  static calculateTotalTime(challenges: Challenge[], avgTimePerChallenge: number = 60): string {
    const totalSeconds = challenges.length * avgTimePerChallenge + 
                        Math.floor(Math.random() * 120); // Variation aléatoire
    
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Calcule le nombre de défis réussis
   */
  static calculateSuccessfulChallenges(challenges: Challenge[]): number {
    return challenges.filter(challenge => challenge.isSuccess).length;
  }

  /**
   * Calcule la série parfaite (défis consécutifs réussis avec score élevé)
   */
  static calculatePerfectStreak(challenges: Challenge[]): number {
    let maxStreak = 0;
    let currentStreak = 0;
    
    challenges.forEach(challenge => {
      if (challenge.isSuccess && this.calculateChallengeScore(challenge) >= 95) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });
    
    return maxStreak;
  }

  /**
   * Détermine le classement de l'utilisateur
   */
  static calculateUserRanking(globalScore: number): number {
    if (globalScore >= 95) return 5;   // Top 5%
    if (globalScore >= 90) return 10;  // Top 10%
    if (globalScore >= 80) return 25;  // Top 25%
    if (globalScore >= 70) return 50;  // Top 50%
    if (globalScore >= 60) return 75;  // Top 75%
    return 100; // Bottom 25%
  }

  /**
   * Génère des conseils personnalisés basés sur les performances
   */
  static generatePersonalizedAdvice(challenges: Challenge[]): {
    strengths: string[];
    improvements: string[];
  } {
    const strengths: string[] = [];
    const improvements: string[] = [];
    
    // Analyse des types de défis
    const imageSuccesses = challenges.filter(c => 
      c.type === 'image_selection' && c.isSuccess
    ).length;
    const multipleSuccesses = challenges.filter(c => 
      c.type === 'multiple' && c.isSuccess
    ).length;
    const booleanSuccesses = challenges.filter(c => 
      c.type === 'boolean' && c.isSuccess
    ).length;
    
    // Forces identifiées
    if (imageSuccesses > 0) {
      strengths.push('Excellente reconnaissance visuelle');
    }
    if (multipleSuccesses > 0) {
      strengths.push('Bonne analyse des choix multiples');
    }
    if (booleanSuccesses > 0) {
      strengths.push('Capacité de jugement efficace');
    }
    
    // Analyse des difficultés
    const failedEasy = challenges.filter(c => 
      c.difficulty === 'easy' && !c.isSuccess
    ).length;
    const failedMedium = challenges.filter(c => 
      c.difficulty === 'medium' && !c.isSuccess
    ).length;
    const failedHard = challenges.filter(c => 
      c.difficulty === 'hard' && !c.isSuccess
    ).length;
    
    // Améliorations suggérées
    if (failedEasy > 0) {
      improvements.push('Attention aux détails sur les défis simples');
    }
    if (failedMedium > 0) {
      improvements.push('Développer la stratégie pour les défis moyens');
    }
    if (failedHard > 0) {
      improvements.push('Patience et méthode pour les défis complexes');
    }
    
    // Conseils généraux si pas d'analyse spécifique
    if (strengths.length === 0) {
      strengths.push('Persévérance et détermination');
    }
    if (improvements.length === 0) {
      improvements.push('Continuer à s\'exercer régulièrement');
    }
    
    return { strengths, improvements };
  }

  /**
   * Calcule les badges obtenus
   */
  static calculateEarnedBadges(challenges: Challenge[]): {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
  }[] {
    const stats = {
      totalChallenges: challenges.length,
      successfulChallenges: this.calculateSuccessfulChallenges(challenges),
      perfectStreak: this.calculatePerfectStreak(challenges),
      globalScore: this.calculateGlobalScore(challenges)
    };
    
    return [
      {
        id: 'finisher',
        name: 'Finisseur',
        description: 'Complété tous les défis',
        icon: '🏁',
        earned: stats.totalChallenges >= 5
      },
      {
        id: 'lightning',
        name: 'Éclair',
        description: 'Défis rapides',
        icon: '⚡',
        earned: stats.successfulChallenges >= 2
      },
      {
        id: 'precision',
        name: 'Précision',
        description: '3 défis parfaits consécutifs',
        icon: '🎯',
        earned: stats.perfectStreak >= 3
      },
      {
        id: 'master',
        name: 'Maître',
        description: 'Score parfait sur tous les défis',
        icon: '👑',
        earned: stats.globalScore >= 95 && stats.successfulChallenges === stats.totalChallenges
      },
      {
        id: 'persistent',
        name: 'Persévérant',
        description: 'Terminé malgré les difficultés',
        icon: '🔥',
        earned: stats.totalChallenges >= 5 && stats.successfulChallenges >= 2
      }
    ];
  }

  /**
   * Formate le temps en mm:ss
   */
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Génère des statistiques comparatives
   */
  static generateComparativeStats(globalScore: number): {
    userScore: number;
    averageScore: number;
    ranking: number;
    percentile: string;
  } {
    const averageScore = 73; // Score moyen simulé
    const ranking = this.calculateUserRanking(globalScore);
    
    return {
      userScore: globalScore,
      averageScore,
      ranking,
      percentile: `Top ${ranking}%`
    };
  }

  /**
   * Génère des données pour le graphique de comparaison
   */
  static generateChartData(globalScore: number) {
    const averageScore = 73;
    return {
      userBar: {
        width: `${globalScore}%`,
        value: `${globalScore}%`,
        label: 'Votre score'
      },
      averageBar: {
        width: `${averageScore}%`,
        value: `${averageScore}%`,
        label: 'Moyenne générale'
      }
    };
  }
}