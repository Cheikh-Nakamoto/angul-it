# Capchat Project Documentation

## 1. Introduction

This document provides a detailed overview of the Capchat Angular application, covering its architecture, key components, services, and utility functions. The application aims to provide a CAPTCHA-like challenge system with various interactive challenges.

## 2. Architecture Overview

The Capchat application follows a modular architecture typical of Angular applications, organized into components, services, and utility modules.

*   **Components:** Handle the UI and user interaction for specific views (e.g., `Capchat`, `Home`, `Result`).
*   **Services:** Encapsulate business logic, data fetching, and state management, making them reusable across components (e.g., `ChallengeService`, `TimerService`).
*   **Utilities:** Provide helper functions for common tasks like DOM manipulation, data transformations, and local storage interactions.
*   **Models:** Define the data structures used throughout the application, ensuring type safety and consistency.

## 3. Core Modules and Functionalities

### 3.1. `Capchat` Component (`src/app/capchat/capchat.ts`)

This is the central component for managing the CAPTCHA challenge flow.

*   **State Management:** Uses Angular signals (`currentChallenge`, `selectedAnswer`, `isCorrect`, `currentStep`, `selectedImageCount`) for reactive state management, ensuring efficient updates to the UI.
*   **Challenge Lifecycle:**
    *   `ngOnInit()`: Initializes the first challenge, sets up the timer, and retrieves previous challenges from storage.
    *   `nextChallenge()`: Advances to the next challenge, cleans up previous selections, resets the timer, and navigates to the result page if all challenges are completed.
    *   `targetChallenge(direction: number)`: Allows navigation to previous or next challenges in the history.
*   **Answer Selection (`selectAnswer`):**
    *   Delegates to `handleImageSelection` or `handleStandardSelection` based on the challenge type.
    *   Manages adding/removing CSS classes (`selected-answer`, `selected-img`) to visually indicate selections.
*   **Verification (`verify_select`):**
    *   Compares the `selectedAnswer` with the `correct_answer` based on the challenge type.
    *   Updates `isCorrect` signal and `currentChallenge` properties (`isSuccess`, `elapsed_time`, `selectedAnswer`).
    *   Calls `nextChallenge()` on success or `replaceCurrentSelectionWithWrongClasses()` on failure.
*   **DOM Interaction:** Utilizes `DomHelpers` for direct DOM manipulation, ensuring proper class management for visual feedback.
*   **Error Handling:** Includes `console.warn` for cases where elements are not found during selection, and defensive checks for `null`/`undefined` values.

### 3.2. `ChallengeService` (`src/app/services/challenge.ts`)

*   **Purpose:** Provides methods for fetching random challenge data.
*   **Key Method:** `getRandomChallenge()`: Asynchronously fetches a new challenge.

### 3.3. `TimerService` (`src/app/services/timer.ts`)

*   **Purpose:** Manages a countdown timer for each challenge.
*   **Key Methods:**
    *   `startTimer(callback: () => void)`: Starts the timer and executes a callback function when time runs out.
    *   `resetTimer()`: Resets the timer to its initial state.
    *   `elapsed_time()`: Returns the time elapsed since the timer started.

### 3.4. `DomHelpers` (`src/app/utils/dom-helpers.ts`)

*   **Purpose:** A utility service for abstracting direct DOM manipulation.
*   **Key Methods:**
    *   `getElementById(id: string | number)`: Safely retrieves an HTML element by its ID.
    *   `addClass(element: HTMLElement, className: string)`: Adds a CSS class to an element.
    *   `removeClass(element: HTMLElement, className: string)`: Removes a CSS class from an element.

### 3.5. `StorageHelpers` (`src/app/utils/storage-helpers.ts`)

*   **Purpose:** Provides utility functions for interacting with browser's local storage.
*   **Key Methods:**
    *   `saveChallenge(key: string, challenges: Challenge[])`: Saves challenge data to local storage.
    *   `getChallenge(key: string)`: Retrieves challenge data from local storage.

### 3.6. `ChallengeHelpers` (`src/app/utils/challenge-helpers.ts`)

*   **Purpose:** Contains helper functions related to challenge data processing and validation.
*   **Key Methods:**
    *   `getMaxSelections(challenge: Challenge)`: Returns the maximum number of selections allowed for an image challenge.
    *   `getAnswerOptions(challenge: Challenge)`: Returns the answer options for a multiple-choice challenge.
    *   `getImageTarget(challenge: Challenge)`: Returns the target image description for an image selection challenge.
    *   `canVerify(selectedAnswer: any, selectedImageCount: number, challenge: Challenge)`: Determines if the current selection can be verified.
    *   `getQuestionText(challenge: Challenge)`: Returns the question text for the current challenge.
    *   `getCategoryText(challenge: Challenge)`: Returns the category text for the current challenge.
    *   `getDifficultyText(challenge: Challenge)`: Returns the difficulty text for the current challenge.
    *   `getNextChallengeId()`: Generates the ID for the next challenge.

### 3.7. Models (`src/app/models/models.ts`)

Defines the interfaces for different challenge types:

*   `Challenge`: Base interface for all challenges.
*   `MultipleChoiceChallenge`: Extends `Challenge` with properties specific to multiple-choice questions.
*   `ImageSelectionChallenge`: Extends `Challenge` with properties specific to image selection challenges.
*   `ChallengeType`: A union type defining possible challenge types (`'multiple'`, `'boolean'`, `'image_selection'`).

## 4. Development Guidelines

*   **Reactive Programming:** Leverage Angular Signals for state management to ensure efficient change detection and reactive updates.
*   **Separation of Concerns:** Keep components lean by delegating business logic to services and utility functions.
*   **Type Safety:** Utilize TypeScript interfaces and types to enforce data consistency and catch errors at compile time.
*   **DOM Manipulation:** Prefer using `DomHelpers` for direct DOM interactions to centralize and abstract these operations.
*   **Asynchronous Operations:** Use `async/await` for handling asynchronous operations, especially when interacting with external services or waiting for DOM updates.

## 5. Future Enhancements (Potential)

*   **Backend Integration:** Implement a robust backend for storing and serving challenges.
*   **User Authentication:** Add user authentication and progress tracking.
*   **More Challenge Types:** Introduce new types of CAPTCHA challenges.
*   **Styling and Theming:** Enhance the UI/UX with more advanced styling and theming options.
*   **Unit and Integration Tests:** Implement comprehensive tests for all components, services, and utilities.