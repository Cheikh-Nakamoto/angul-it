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
  totalSteps = signal<number>(10);
  selectedImageCount = signal<number>(0);
  maxSelections = signal<number>(3);

  constructor(
    private challengeService: ChallengeService,
    private renderer: Renderer2,
    private timerService: TimerService,
    private domHelpers: DomHelpers,
    private storageHelpers: StorageHelpers,
    private challengeHelpers: ChallengeHelpers,
    private router : Router
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
    elem.id = this.challengeHelpers.getNextChallengeId();
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


  async nextChallenge(): Promise<void> {
    console.log("function next callback");
    // ✅ Attendre un cycle de détection de changement avant le nettoyage
    await new Promise(resolve => setTimeout(resolve, 0));
    
    // Nettoyer les sélections visuelles
    this.cleanupSelectionsWithHelpers();

    // Réinitialiser la sélection AVANT de charger le nouveau challenge
    this.selectedAnswer.set(null);
    this.isCorrect.set(null);

    if (this.challengeHelpers.getNextChallengeId() >= this.totalSteps()){
      this.router.navigateByUrl("result")
    }
    // Création du nouveau challenge
    let elem = await this.challengeService.getRandomChallenge();
    elem.id = this.challengeHelpers.getNextChallengeId()+1;
    console.log(elem)
    this.challengesList.push(this.currentChallenge());
    this.currentChallenge.set(elem);


    // Sauvegarde des anciens challenges
    this.storageHelpers.saveChallenge("old", this.challengesList);
    this.currentStep.set(Math.min(elem.id, this.totalSteps()));
    this.timerService.resetTimer();
  }


  previousChallenge(): void {
    if (this.challengesList.length > 0) {
      const previousChallenge = this.challengesList.pop();
      if (previousChallenge) {
        // Réinitialiser la sélection
        this.selectedAnswer.set(null);
        this.currentChallenge.set(previousChallenge);
        this.currentStep.set(Math.max(this.currentStep() - 1, 1));
        this.timerService.resetTimer();
      }
    }
  }

  get currentImageChallenge(): ImageSelectionChallenge | null {
    const challenge = this.currentChallenge();
    if (challenge.type === 'image_selection') {
      console.log(challenge.isSuccess)
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

    if (index > -1) {
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
      this.currentChallenge.set(currentChallengeValue);

      // ✅ Attendre que le DOM soit mis à jour avant de passer au challenge suivant
      await new Promise(resolve => setTimeout(resolve, 0));
      await this.nextChallenge();
    }else{
       this.replaceCurrentSelectionWithWrongClasses();
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
            console.log("Id elem",id)
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
    },1000)
  }
  ngOnDestroy() {
    this.timerService.ngOnDestroy();
    this.destroy$.next();
    this.destroy$.complete();
  }
}

function getChallenge(arg0: string) {
  throw new Error('Function not implemented.');
}
