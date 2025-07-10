import { Component, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { ChallengeService } from '../services/challenge';
import { Subject } from 'rxjs';
import { Challenge } from '../models/models';

@Component({
  selector: 'app-capchat',
  imports: [],
  templateUrl: './capchat.html',
  styleUrl: './capchat.scss'
})
export class Capchat implements OnInit, OnDestroy {
  challengesList: Challenge[] = [];
  currentChallenge: Challenge = {}
  selectedAnswer: string | number | (string | number)[] | null = null; // Supports single selection or multi-selection for images
  private destroy$ = new Subject<void>();
  private isNext: boolean = false;

  constructor(private challengeService: ChallengeService, private renderer: Renderer2) { }

  async ngOnInit(): Promise<void> {
    const elem = await this.challengeService.getRandomChallenge();
    this.challengesList.push(elem);
    console.log(this.challengesList)
  }

  async nextChallenge(): Promise<void> {
    const elem = await this.challengeService.getRandomChallenge();
    this.challengesList.push(elem);
  }

  previouqChallenge(): void {

  }

  /**
   * Handles the selection of an answer, applying or removing CSS classes as needed.
   * @param selectedId The ID of the newly selected answer element.
   * @param selectionType The type of selection (e.g., "image_selection" or other).
   */
  selectanswer(selectedId: string | number, selectionType: string): void {
    const className = selectionType !== 'image_selection' ? 'selected-answer' : 'selected-img';

    if (selectionType === 'image_selection') {
      // Handle multi-selection for images
      if (this.selectedAnswer === null) {
        this.selectedAnswer = []; // Initialize as array if first image selection
      } else if (!Array.isArray(this.selectedAnswer)) {
        // If previously a single selection, clear it and convert to array
        const prevSelectedElement = this.getElementById(this.selectedAnswer);
        if (prevSelectedElement) {
          this.renderer.removeClass(prevSelectedElement, 'selected-answer'); // Use specific class for single selection
        }
        this.selectedAnswer = [];
      }

      const currentSelectedElement = this.getElementById(selectedId);
      if (currentSelectedElement) {
        const selectedIdString = selectedId.toString();
        const selectedAnswersArray = this.selectedAnswer as (string | number)[];
        const index = selectedAnswersArray.indexOf(selectedId);

        if (index > -1) {
          // If already selected, remove it
          this.renderer.removeClass(currentSelectedElement, className);
          selectedAnswersArray.splice(index, 1);
        } else {
          // If not selected, add it
          this.renderer.addClass(currentSelectedElement, className);
          selectedAnswersArray.push(selectedId);
        }
      } else {
        console.warn(`Element with ID '${selectedId}' not found. Cannot toggle selection.`);
      }
    } else {
      // Handle single selection for other types
      // Remove class from previously selected element, if any
      if (this.selectedAnswer !== null) {
        // Ensure selectedAnswer is treated as a single value for non-image selections
        const prevSelectedElement = this.getElementById(this.selectedAnswer as string | number);
        if (prevSelectedElement) {
          this.renderer.removeClass(prevSelectedElement, className);
        }
      }

      // Add class to the newly selected element
      const currentSelectedElement = this.getElementById(selectedId);
      if (currentSelectedElement) {
        this.renderer.addClass(currentSelectedElement, className);
        this.selectedAnswer = selectedId; // Update the component's state
      } else {
        // Log a warning if the element is not found and clear selection
        console.warn(`Element with ID '${selectedId}' not found. Cannot apply selection.`);
        this.selectedAnswer = null;
      }
    }
  }

  /**
   * Helper method to safely get an element by its ID.
   * @param id The ID of the element to retrieve.
   * @returns The HTMLElement if found, otherwise null.
   */
  private getElementById(id: string | number): HTMLElement | null {
    const element = document.getElementById(id.toString());
    if (!element) {
      console.warn(`Attempted to access element with ID '${id}' which does not exist.`);
    }
    return element;
  }

  saveState(key: string, value: string): void {
    localStorage.setItem(key, value);
  }

  saveChallenge(id: string, challenges: Challenge[]): void {
    const value = JSON.stringify(challenges);
    localStorage.setItem(id, value);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
