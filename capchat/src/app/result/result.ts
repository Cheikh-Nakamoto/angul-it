import { Component, OnInit, signal } from '@angular/core';
import { Badge, Challenge, ChallengeResult, ChallengeType, GlobalStats } from '../models/models';
import { StorageHelpers } from '../utils/storage-helpers';
import { Router } from '@angular/router';
import { TimerService } from '../services/timer';

@Component({
  selector: 'app-result',
  imports: [],
  templateUrl: './result.html',
  styleUrl: './result.scss'
})
export class Result implements OnInit {
  // Signaux pour la réactivité
  challengeResults = signal<ChallengeResult[]>([]);
  globalStats = signal<GlobalStats>({
    globalScore: 0,
    totalTime: '0:00',
    successfulChallenges: 0,
    perfectStreak: 0,
    totalChallenges: 0
  });

  badges = signal<Badge[]>([]);
  userRanking = signal<number>(0);
  averageScore = signal<number>(73);

  constructor(
    private router: Router,
    private storageHelpers: StorageHelpers,
    private timerService: TimerService
  ) { }

  ngOnInit(): void {
    this.loadChallengeResults();
    this.calculateGlobalStats();
    this.calculateBadges();
    this.calculateRanking();
  }

  /**
   * Charge les résultats des défis depuis le localStorage
   */
  private loadChallengeResults(): void {
    const challenges = this.storageHelpers.getChallenge("old") || [];
    const results: ChallengeResult[] = [];

    challenges.forEach((challenge: Challenge, index: number) => {
      const result: ChallengeResult = {
        challenge,
        timeSpent: challenge.elapsed_time != undefined ? challenge.elapsed_time : 100, // Temps simulé en secondes
        score: this.calculateChallengeScore(challenge),
        attempts: challenge.attempts ? challenge.attempts : 1,
        isSuccess: challenge.isSuccess || false
      };
      results.push(result);
    });

    this.challengeResults.set(results);
  }

  /**
   * Calcule le score d'un défi individuel
   */
  private calculateChallengeScore(challenge: Challenge): number {
    const elapsed_time = challenge.elapsed_time != undefined ? 165-challenge.elapsed_time : 165
    if (challenge.isSuccess) {
      // Score parfait avec petite variation aléatoire
      return  100 * (elapsed_time / 165);
    }
    // Score d'échec
    return 30 * (elapsed_time / 165);
  }

  /**
   * Calcule les statistiques globales
   */
  private calculateGlobalStats(): void {
    const results = this.challengeResults();
    const totalChallenges = results.length;
    const successfulChallenges = results.filter(r => r.isSuccess).length;
    const totalTimeSeconds = results.reduce((sum, r) => sum + r.timeSpent, 0);
    const totalScore = results.reduce((sum, r) => sum + r.score, 0);
    const globalScore = totalChallenges > 0 ? Math.round(totalScore / totalChallenges) : 0;

    // Calcul de la série parfaite
    let perfectStreak = 0;
    let currentStreak = 0;
    results.forEach(result => {
      if (result.isSuccess && result.score >= 95) {
        currentStreak++;
        perfectStreak = Math.max(perfectStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    });

    this.globalStats.set({
      globalScore,
      totalTime: this.formatTime(totalTimeSeconds),
      successfulChallenges,
      perfectStreak,
      totalChallenges
    });
  }

  /**
   * Calcule les badges obtenus
   */
  private calculateBadges(): void {
    const results = this.challengeResults();
    const stats = this.globalStats();

    const badges: Badge[] = [
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
        description: 'Défis 1-2 en moins de 1 minute',
        icon: '⚡',
        earned: this.hasLightningBadge(results)
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
        earned: results.every(r => r.score >= 90)
      }
    ];

    this.badges.set(badges);
  }

  /**
   * Vérifie si l'utilisateur a obtenu le badge Éclair
   */
  private hasLightningBadge(results: ChallengeResult[]): boolean {
    return results.slice(0, 2).every(r => r.timeSpent < 30);
  }

  /**
   * Calcule le classement de l'utilisateur
   */
  private calculateRanking(): void {
    const globalScore = this.globalStats().globalScore;
    const averageScore = this.averageScore();

    if (globalScore >= 90) {
      this.userRanking.set(10); // Top 10%
    } else if (globalScore >= 80) {
      this.userRanking.set(25); // Top 25%
    } else if (globalScore >= averageScore) {
      this.userRanking.set(50); // Top 50%
    } else {
      this.userRanking.set(75); // Top 75%
    }
  }

  /**
   * Formate le temps en mm:ss
   */
  public formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  /**
   * Génère un temps aléatoire pour la simulation
   */
  private getRandomTime(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Retourne le nom du défi basé sur son type
   */
  getChallengeTypeName(type?: ChallengeType): string {
    switch (type) {
      case 'image_selection':
        return 'Reconnaissance d\'images';
      case 'multiple':
        return 'Choix multiple';
      case 'boolean':
        return 'Vrai/Faux';
      default:
        return 'Défi inconnu';
    }
  }

  /**
   * Retourne la description du défi
   */
  getChallengeDescription(challenge: Challenge): string {
    switch (challenge.type) {
      case 'image_selection':
        return 'Sélectionner toutes les images correctes';
      case 'multiple':
        return challenge.question || 'Choisir la bonne réponse';
      case 'boolean':
        return challenge.question || 'Répondre par vrai ou faux';
      default:
        return 'Défi à compléter';
    }
  }

  /**
   * Retourne la classe CSS pour le badge de résultat
   */
  getResultBadgeClass(isSuccess: boolean): string {
    return isSuccess ? 'result-badge success' : 'result-badge failed';
  }

  /**
   * Retourne le texte du badge de résultat
   */
  getResultBadgeText(isSuccess: boolean): string {
    return isSuccess ? 'Réussi' : 'Échoué';
  }

  /**
   * Retourne la classe CSS pour l'item de défi
   */
  getChallengeItemClass(isSuccess: boolean): string {
    return isSuccess ? 'challenge-item success' : 'challenge-item failed';
  }

  /**
   * Retourne les points forts basés sur les résultats
   */
  getStrengths(): string[] {
    const results = this.challengeResults();
    const strengths: string[] = [];

    // Analyse des forces basée sur les résultats
    const fastChallenges = results.filter(r => r.timeSpent < 60);
    if (fastChallenges.length >= 2) {
      strengths.push('Excellente rapidité sur les défis simples');
    }

    const imageSuccesses = results.filter(r =>
      r.challenge.type === 'image_selection' && r.isSuccess
    );
    if (imageSuccesses.length > 0) {
      strengths.push('Très bonne reconnaissance visuelle');
    }

    const consistentPerformance = results.filter(r => r.score >= 80);
    if (consistentPerformance.length >= results.length * 0.6) {
      strengths.push('Concentration maintenue durant tout le test');
    }

    return strengths.length > 0 ? strengths : ['Persévérance dans l\'effort'];
  }

  /**
   * Retourne les axes d'amélioration
   */
  getImprovements(): string[] {
    const results = this.challengeResults();
    const improvements: string[] = [];

    // Analyse des faiblesses
    const failedChallenges = results.filter(r => !r.isSuccess);
    if (failedChallenges.length > 0) {
      improvements.push('Attention aux défis combinés complexes');
    }

    const slowChallenges = results.filter(r => r.timeSpent > 120);
    if (slowChallenges.length > 0) {
      improvements.push('Prendre plus de temps pour vérifier');
    }

    const lastChallenges = results.slice(-2);
    if (lastChallenges.some(r => !r.isSuccess)) {
      improvements.push('Gérer le stress sur les derniers défis');
    }

    return improvements.length > 0 ? improvements : ['Continuer à s\'entraîner régulièrement'];
  }

  /**
   * Retourne le texte de statistique pour un défi
   */
  getChallengeStatText(result: ChallengeResult): string {
    if (result.isSuccess) {
      return result.attempts === 1 ? 'Première tentative' : `${result.attempts} tentatives`;
    }
    return `${result.attempts} tentatives`;
  }

  /**
   * Actions des boutons
   */
  downloadReport(): void {
    // Logique pour télécharger le rapport
    console.log('Téléchargement du rapport...');
  }

  shareResults(): void {
    // Logique pour partager les résultats
    console.log('Partage des résultats...');
  }

  retryChallenge(): void {
    // Nettoyer le localStorage et rediriger
    this.storageHelpers.clearStorage();
    this.router.navigateByUrl('/captcha');
  }

  goHome(): void {
    this.router.navigateByUrl('/');
  }

  /**
   * Computed properties pour le template
   */
  get earnedBadges() {
    return this.badges().filter(b => b.earned);
  }

  get lockedBadges() {
    return this.badges().filter(b => !b.earned);
  }

  get userRankingText() {
    return `Top ${this.userRanking()}%`;
  }

  get barWidth() {
    return `${this.globalStats().globalScore}%`;
  }

  get averageBarWidth() {
    return `${this.averageScore()}%`;
  }
}