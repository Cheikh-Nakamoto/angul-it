import { Component, OnDestroy, OnInit, Renderer2, signal, effect } from '@angular/core';
import { ChallengeService } from '../services/challenge';
import { Subject } from 'rxjs';
import {
  Challenge,
  MultipleChoiceChallenge,
  ImageSelectionChallenge,
  ChallengeType
} from '../models/models';
import { sameElementsSorted } from '../utils/utils';
import { DomHelpers } from '../utils/dom-helpers';
import { StorageHelpers } from '../utils/storage-helpers';
import { ChallengeHelpers } from '../utils/challenge-helpers';
import { TimerService } from '../services/timer';

@Component({
  selector: 'app-capchat',
  imports: [],
  templateUrl: './capchat.html',
  styleUrl: './capchat.scss'
})
export class Capchat implements OnInit, OnDestroy {
  challengesList: Challenge[] = [];
  currentChallenge = signal<Challenge>({});
  selectedAnswer = signal<string | number | (string | number)[] | null>(null);
  private destroy$ = new Subject<void>();
  private isNext: boolean = false;
  isCorrect = signal<boolean | null>(null);

  // Variables pour le template
  currentStep = signal<number>(1);
  totalSteps = signal<number>(10);
  selectedImageCount = signal<number>(0);
  maxSelections = signal<number>(3);

  constructor(
    private challengeService: ChallengeService,
    private renderer: Renderer2,
    private timerService: TimerService,
    private domHelpers: DomHelpers,
    private storageHelpers: StorageHelpers,
    private challengeHelpers: ChallengeHelpers
  ) {
    effect(() => {
      const currentChallengeValue = this.currentChallenge();
      const selectedAnswerValue = this.selectedAnswer();

      // Attendre que le DOM soit mis à jour
      setTimeout(() => {
        // Mettre à jour le compteur d'images sélectionnées
        if (Array.isArray(selectedAnswerValue)) {
          this.selectedImageCount.set(selectedAnswerValue.length);
        } else if (selectedAnswerValue !== null && currentChallengeValue.type === 'image_selection') {
          this.selectedImageCount.set(1);
        } else {
          this.selectedImageCount.set(0);
        }
      }, 0);
    });
  }

  get timeRemaining() {
    return this.timerService.timeRemaining;
  }

  async ngOnInit(): Promise<void> {
    const elem = await this.challengeService.getRandomChallenge();
    this.currentChallenge.set(elem);
    this.timerService.startTimer(() => this.handleTimeUp());
    console.log(this.challengesList);
  }

  handleTimeUp(): void {
    console.log('Temps écoulé !');
  }

  private cleanupSelections(): void {
    // Nettoyer les sélections des réponses multiples
    const selectedAnswers = document.querySelectorAll('.selected-answer');
    selectedAnswers.forEach(el => el.classList.remove('selected-answer'));

    // Nettoyer les sélections d'images
    const selectedImages = document.querySelectorAll('.selected-img');
    selectedImages.forEach(el => el.classList.remove('selected-img'));
  }


  async nextChallenge(): Promise<void> {
    // Nettoyer les sélections visuelles
    console.log("function next callback")
    this.cleanupSelections();
    //creation du nouveau challenge
    const elem = await this.challengeService.getRandomChallenge();
    this.challengesList.push(this.currentChallenge());
    this.currentChallenge.set(elem);

    // Réinitialiser la sélection
    this.selectedAnswer.set(null);
    //sauvegarde des ancien challenge fait par le client
    this.storageHelpers.saveChallenge("old", this.challengesList);
    this.currentStep.set(Math.min(this.currentStep()+1, this.totalSteps()));
    this.timerService.resetTimer();
  }

  previousChallenge(): void {
    if (this.challengesList.length > 0) {
      const previousChallenge = this.challengesList.pop();
      if (previousChallenge) {
        this.currentChallenge.set(previousChallenge);
        this.currentStep.set(Math.max(this.currentStep() - 1, 1));
        this.timerService.resetTimer();
      }
    }
  }

  get currentImageChallenge(): ImageSelectionChallenge | null {
    const challenge = this.currentChallenge();
    if (challenge.type === 'image_selection') {
      return challenge as ImageSelectionChallenge;
    }
    return null;
  }

  getMaxSelections(): number {
    return this.challengeHelpers.getMaxSelections(this.currentChallenge());
  }

  getAnswerOptions(): string[] {
    return this.challengeHelpers.getAnswerOptions(this.currentChallenge());
  }

  getImageTarget(): string {
    return this.challengeHelpers.getImageTarget(this.currentChallenge());
  }

  canVerify(): boolean {
    return this.challengeHelpers.canVerify(this.selectedAnswer(), this.selectedImageCount(), this.currentChallenge());
  }

  getQuestionText(): string {
    return this.challengeHelpers.getQuestionText(this.currentChallenge());
  }

  getCategoryText(): string {
    return this.challengeHelpers.getCategoryText(this.currentChallenge());
  }

  getDifficultyText(): string {
    return this.challengeHelpers.getDifficultyText(this.currentChallenge());
  }

  selectAnswer(selectedId: string | number, selectionType: string): void {
    const className = selectionType !== 'image_selection' ? 'selected-answer' : 'selected-img';

    if (selectionType === 'image_selection') {
      this.handleImageSelection(selectedId, className);
    } else {
      this.handleStandardSelection(selectedId, className);
    }
  }

  private handleImageSelection(selectedId: string | number, className: string): void {
    // Initialize or clean up previous selection if needed
    if (this.selectedAnswer() === null) {
      this.selectedAnswer.set([]);
    } else if (!Array.isArray(this.selectedAnswer())) {
      this.domHelpers.removeClass(this.domHelpers.getElementById(this.selectedAnswer() as string | number)!, className);
      this.selectedAnswer.set([]);
    }

    const currentSelectedElement = this.domHelpers.getElementById(selectedId.toString());

    if (!currentSelectedElement) {
      console.warn(`Element with ID '${selectedId}' not found. Cannot toggle selection.`);
      return;
    }

    const selectedAnswersArray = this.selectedAnswer() as (string | number)[];
    const index = selectedAnswersArray.indexOf(selectedId);

    if (index > -1) {
      // Deselect the item
      this.domHelpers.removeClass(currentSelectedElement, className);
      this.selectedAnswer.set(selectedAnswersArray.filter(item => item !== selectedId));
    } else {
      this.domHelpers.addClass(currentSelectedElement, className);
      this.selectedAnswer.set([...selectedAnswersArray, selectedId]);
    }
  }

  private handleStandardSelection(selectedId: string | number, className: string): void {
    // Clean up previous selection if it exists
    if (this.selectedAnswer() !== null) {
      const prevSelectedElement = this.domHelpers.getElementById(this.selectedAnswer() as string | number);
      if (prevSelectedElement) {
        this.domHelpers.removeClass(prevSelectedElement, className);
      }
    }

    const currentSelectedElement = this.domHelpers.getElementById(selectedId);

    if (currentSelectedElement) {
      this.domHelpers.addClass(currentSelectedElement, className);
      this.selectedAnswer.set(selectedId);
    } else {
      console.warn(`Element with ID '${selectedId}' not found. Cannot apply selection.`);
      this.selectedAnswer.set(null);
    }
  }

  verify_select() {
    let currentChallengeValue = this.currentChallenge();
    const selectedAnswerValue = this.selectedAnswer();
    let isCorrect: boolean = false;
    if (currentChallengeValue.type === "image_selection") {
      const correctPositions = currentChallengeValue.correctPos || [];
      let selectedAnswersArray: (string | number)[] = [];

      if (Array.isArray(selectedAnswerValue)) {
        selectedAnswersArray = selectedAnswerValue;
      } else if (selectedAnswerValue !== null) {
        selectedAnswersArray = [selectedAnswerValue];
      }

      isCorrect = sameElementsSorted(correctPositions, selectedAnswersArray);
    } else if (currentChallengeValue.type === 'multiple' || currentChallengeValue.type === 'boolean') {
      const selectedAnswer = selectedAnswerValue as string;
      const correctAnswer = currentChallengeValue.correct_answer;
      isCorrect = correctAnswer == selectedAnswer;
    }
    currentChallengeValue.isSuccess = isCorrect;
    this.currentChallenge.set(currentChallengeValue);
    this.nextChallenge();
  }

  ngOnDestroy() {
    this.timerService.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}