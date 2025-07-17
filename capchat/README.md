# Capchat Application

This project is an Angular application that implements a CAPTCHA-like challenge system. Users are presented with various challenges, including image selection and multiple-choice questions, to verify they are not robots.

## Project Structure

The application is structured into several Angular components, services, and utility files:

*   `src/app/capchat/`: Contains the core CAPTCHA challenge logic and UI.
*   `src/app/home/`: The landing page of the application.
*   `src/app/result/`: Displays the results after completing the challenges.
*   `src/app/services/`: Houses services for managing challenges (`challenge.ts`) and timers (`timer.ts`).
*   `src/app/utils/`: Contains utility functions for DOM manipulation (`dom-helpers.ts`), challenge-related helpers (`challenge-helpers.ts`), and local storage interactions (`storage-helpers.ts`).
*   `src/app/models/`: Defines data models used throughout the application, such as `Challenge`, `MultipleChoiceChallenge`, and `ImageSelectionChallenge`.

## Features

*   **Multiple Challenge Types:** Supports image selection and multiple-choice challenges.
*   **Dynamic Challenge Loading:** Challenges are fetched randomly.
*   **Timer Functionality:** Each challenge has a time limit.
*   **Navigation:** Users can navigate between challenges and to a results page.
*   **Responsive Design:** (Assuming based on typical Angular projects, if not explicitly stated in code)

## Setup and Installation

To set up and run this project locally, follow these steps:

1.  **Navigate to the `capchat` directory:**
    ```bash
    cd capchat
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    ng serve
    ```
    This will start the development server. Open your browser and navigate to `http://localhost:4200/`.

## Development

### Code Style

This project adheres to standard Angular and TypeScript best practices.

### Key Components and Services

*   **`Capchat` Component (`src/app/capchat/capchat.ts`):** Manages the state and logic for the CAPTCHA challenges. It interacts with `ChallengeService` to fetch challenges, `TimerService` for timing, and `DomHelpers` for UI manipulations.
*   **`ChallengeService` (`src/app/services/challenge.ts`):** Responsible for providing challenge data.
*   **`TimerService` (`src/app/services/timer.ts`):** Manages the countdown timer for challenges.
*   **`DomHelpers` (`src/app/utils/dom-helpers.ts`):** Provides utility functions for interacting with the DOM, such as adding/removing classes and getting elements by ID.

## Contributing

Contributions are welcome! Please ensure your code adheres to the existing style and practices. For major changes, please open an issue first to discuss what you would like to change.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
