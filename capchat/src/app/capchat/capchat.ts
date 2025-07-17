import { Component, OnDestroy, OnInit, Renderer2, signal, effect, computed } from '@angular/core';
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
import { Route, Router } from '@angular/router';
import { DataService } from '../services/data-service';

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
  isCorrect = signal<boolean | null>(null);

  // Variables pour le template
  currentStep = signal<number>(1);
  totalSteps = signal<number>(5);
  selectedImageCount = signal<number>(0);
  maxSelections = signal<number>(3);

  constructor(
    private challengeService: ChallengeService,
    private renderer: Renderer2,
    private timerService: TimerService,
    private domHelpers: DomHelpers,
    private storageHelpers: StorageHelpers,
    private challengeHelpers: ChallengeHelpers,
    private dataService: DataService,
    private router: Router
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
    let elem = await this.challengeService.getRandomChallenge();
    elem.id = await this.challengeHelpers.getNextChallengeId();
    this.currentChallenge.set(elem);
    this.challengesList = this.storageHelpers.getChallenge("old")!;
    this.currentStep.set(elem.id);
    this.timerService.startTimer(() => this.handleTimeUp());
  }

  handleTimeUp(): void {
    console.log('Temps écoulé !');
  }

  private cleanupSelectionsWithHelpers(): void {
    // Nettoyer les réponses
    const selectedAnswers = document.querySelectorAll('.selected-answer, .wrong-selected-answer');
    selectedAnswers.forEach(el => {
      this.domHelpers.removeClass(el as HTMLElement, 'selected-answer');
      this.domHelpers.removeClass(el as HTMLElement, 'wrong-selected-answer');
    });

    // Nettoyer les images
    const selectedImages = document.querySelectorAll('.selected-img, .wrong-selected-img');
    selectedImages.forEach(el => {
      this.domHelpers.removeClass(el as HTMLElement, 'selected-img');
      this.domHelpers.removeClass(el as HTMLElement, 'wrong-selected-img');
    });

    // Réinitialiser le compteur
    this.selectedImageCount.set(0);
  }


  async nextChallenge(type: string): Promise<void> {
    console.log("function next callback");
    // ✅ Attendre un cycle de détection de changement avant le nettoyage
    await new Promise(resolve => setTimeout(resolve, 0));

    // Nettoyer les sélections visuelles
    this.cleanupSelectionsWithHelpers();

    // Réinitialiser la sélection AVANT de charger le nouveau challenge
    this.selectedAnswer.set(null);
    this.isCorrect.set(null);

    if (await this.challengeHelpers.getNextChallengeId() >= this.totalSteps()) {
      this.dataService.CaptchaComplet();
      this.router.navigateByUrl("result")
    }

    // Sauvegarde des anciens challenges
    console.log("pass" == type)
    if (type != 'pass') {
      console.log("cureen")
      this.challengesList.push(this.currentChallenge());
    }
    this.storageHelpers.saveChallenge("old", this.challengesList);
    this.currentStep.set(Math.min(this.challengesList.length + 1, this.totalSteps()));
    this.timerService.resetTimer();


    // Création du nouveau challenge
    let elem = await this.challengeService.getRandomChallenge();
    elem.id = await this.challengeHelpers.getNextChallengeId();
    this.currentChallenge.set(elem);
  }



  async targetChallenge(direction: number): Promise<void> {
    // Calculate the target challenge ID (1-based)
    let targetChallengeId = this.currentStep();
    this.cleanupSelectionsWithHelpers()
    if (direction === -1) {
      targetChallengeId = Math.max(1, targetChallengeId - 1); // Go back, but not below 1
    } else { // direction === 1
      // Go forward, but not beyond the last completed challenge in challengesList
      // The challengesList contains challenges from ID 1 to (challengesList.length)
      targetChallengeId = Math.min(this.challengesList.length, targetChallengeId + 1);
    }
    console.log('home page back')
    if (targetChallengeId - 1 < 0) {
      this.router.navigateByUrl('');
      return;
    }

    // If the targetChallengeId is the same as the current one, or out of valid range, do nothing
    // The valid range for targetChallengeId is 1 to challengesList.length
    if (targetChallengeId > this.challengesList.length || targetChallengeId === this.currentStep()) {
      await this.nextChallenge("pass");
      return;
    }

    // Access the challenge from challengesList using 0-based index
    const targetChallenge = this.challengesList[targetChallengeId - 1];
    console.log(targetChallenge)
    if (targetChallenge) {
      const selected = targetChallenge.selectedAnswer ?? null; // Use nullish coalescing for cleaner check
      this.selectedAnswer.set(null); // Clear current selection
      this.selectedImageCount.set(0)
      this.currentChallenge.set(targetChallenge);
      this.selectedAnswer.set(selected); // Set selection for the target challenge
      this.currentStep.set(targetChallengeId); // Update current step to the target challenge ID
      this.timerService.resetTimer();
      await this.replaceSelect()
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

  selectAnswer(selectedId: string | number, selectionType: string, replace: string): void {
    const className = selectionType !== 'image_selection' ? 'selected-answer' : 'selected-img';
    if (selectionType === 'image_selection') {
      this.handleImageSelection(selectedId, className, replace);
    } else {
      this.handleStandardSelection(selectedId, className);

    }
  }

  private handleImageSelection(selectedId: string | number, className: string, replace: string): void {
    // Initialize or clean up previous selection if needed
    let count = this.selectedImageCount();

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
    if (index > -1 && replace != 'replace') {
      // Deselect the item
      this.domHelpers.removeClass(currentSelectedElement, className);
      this.selectedImageCount.set(count - 1);
      this.selectedAnswer.set(selectedAnswersArray.filter(item => item !== selectedId));
    } else {
      this.domHelpers.addClass(currentSelectedElement, className);
      this.selectedAnswer.set([...selectedAnswersArray, selectedId]);
      this.selectedImageCount.set(count + 1);
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

  async verify_select() {
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

      //this.selectAnswer(selectedAnswer,"wrong-selected-answer")
    }


    if (isCorrect) {
      currentChallengeValue.isSuccess = isCorrect;
      const elapsed_time = this.timerService.elapsed_time();

      currentChallengeValue.elapsed_time = elapsed_time;
      currentChallengeValue.selectedAnswer = selectedAnswerValue;
      this.currentChallenge.set(currentChallengeValue);

      // ✅ Attendre que le DOM soit mis à jour avant de passer au challenge suivant
      await this.nextChallenge("new");
    } else {
      this.replaceCurrentSelectionWithWrongClasses();
      currentChallengeValue.attempts = currentChallengeValue.attempts == undefined ? 1 : currentChallengeValue.attempts + 1;
      this.currentChallenge.set(currentChallengeValue);
    }
  }

  async replaceSelect() { // Made the function asynchronous
    const currentChallenge = this.currentChallenge();
    const selectedAnswer = currentChallenge.selectedAnswer;

    // If no answer was previously selected, there's nothing to re-select visually.
    if (selectedAnswer === null || selectedAnswer === undefined) {
      return;
    }

    // Wait for the DOM to update before attempting to re-select elements.
    // This addresses the "Element with ID 'X' not found" error.
    await new Promise(resolve => setTimeout(resolve, 100));

    // Determine challenge type based on the current challenge's type.
    const challengeType = currentChallenge.type === 'image_selection' ? 'image_selection' : 'multiple';

    if (Array.isArray(selectedAnswer)) {
      // If selectedAnswer is an array, iterate over each item and select it.
      for (const select of selectedAnswer) {
        // Ensure 'select' is a string or number before passing to selectAnswer.
        if (typeof select === 'string' || typeof select === 'number') {
          console.log("ici imageselected")
          this.selectAnswer(select, challengeType, "replace");
        } else {
          // Log a warning for unexpected types, though this case should ideally not occur.
          console.warn(`Unexpected type for selected answer element: ${typeof select}. Expected string or number.`);
        }
      }
    } else {
      // If selectedAnswer is a single value (string or number), select it directly.
      this.selectAnswer(selectedAnswer, challengeType, "replace");
    }
  }


  private replaceCurrentSelectionWithWrongClasses(): void {
    const selectedAnswerValue = this.selectedAnswer();
    const currentChallengeValue = this.currentChallenge();

    if (currentChallengeValue.type === 'image_selection') {
      // Gestion des images sélectionnées
      if (Array.isArray(selectedAnswerValue)) {
        selectedAnswerValue.forEach(id => {
          const element = this.domHelpers.getElementById(id);
          if (element) {
            console.log("Id elem", id)
            this.domHelpers.removeClass(element, 'selected-img');
            this.domHelpers.addClass(element, 'wrong-selected-img');
          }
        });
      } else if (selectedAnswerValue !== null) {
        const element = this.domHelpers.getElementById(selectedAnswerValue);
        if (element) {
          this.domHelpers.removeClass(element, 'selected-img');
          this.domHelpers.addClass(element, 'wrong-selected-img');
        }
      }
    } else if (currentChallengeValue.type === 'multiple' || currentChallengeValue.type === 'boolean') {
      // Gestion des réponses multiples/boolean
      if (selectedAnswerValue !== null) {
        const element = this.domHelpers.getElementById(selectedAnswerValue.toString());
        if (element) {
          this.domHelpers.removeClass(element, 'selected-answer');
          this.domHelpers.addClass(element, 'wrong-selected-answer');
        }
      }
    }

    setTimeout(() => {
      this.cleanupSelectionsWithHelpers()
      this.selectedAnswer.set([]);
    }, 1000)
  }

  IsSuccess(): boolean {
    const curentChallenge = this.currentChallenge();
    return curentChallenge.isSuccess == undefined ? false : curentChallenge.isSuccess
  }
  ngOnDestroy() {
    this.timerService.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}
