# Capchat Application

A modern Angular application that implements an interactive CAPTCHA-like challenge system. Users must complete various verification challenges, including image selection and multiple-choice questions, to prove they are human.

## 🚀 Features

- **Multiple Challenge Types**: Support for image selection and multiple-choice question challenges
- **Dynamic Challenge Loading**: Challenges are randomly fetched to ensure variety
- **Timer Functionality**: Each challenge includes a configurable time limit with visual countdown
- **Intuitive Navigation**: Seamless flow between challenges and results page
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Feedback**: Immediate validation and progress tracking
- **Local Storage Integration**: Maintains challenge state and progress across sessions

## 📁 Project Structure

```
src/app/
├── capchat/              # Core CAPTCHA challenge logic and UI components
├── home/                 # Landing page and application entry point
├── result/               # Results display and completion summary
├── services/
│   ├── challenge.ts      # Challenge data management and fetching
│   └── timer.ts          # Timer functionality and countdown logic
├── utils/
│   ├── dom-helpers.ts    # DOM manipulation utilities
│   ├── challenge-helpers.ts # Challenge-specific utility functions
│   └── storage-helpers.ts   # Local storage interaction helpers
└── models/               # TypeScript interfaces and data models
    ├── Challenge.ts
    ├── MultipleChoiceChallenge.ts
    └── ImageSelectionChallenge.ts
```

## 🛠️ Setup and Installation

### Prerequisites

- Node.js (version 16 or higher)
- Angular CLI (version 15 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone [repository-url]
   cd capchat
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   ng serve
   ```

4. **Open the application**
   Navigate to `http://localhost:4200/` in your browser

### Build for Production

```bash
ng build --prod
```

The build artifacts will be stored in the `dist/` directory.

## 🏗️ Architecture Overview

### Core Components

#### **Capchat Component** (`src/app/capchat/capchat.ts`)
- Primary orchestrator for challenge flow and state management
- Integrates with `ChallengeService` for data fetching
- Manages timer functionality through `TimerService`
- Handles UI updates via `DomHelpers`

#### **ChallengeService** (`src/app/services/challenge.ts`)
- Centralized challenge data provider
- Implements random challenge selection algorithm
- Manages challenge validation logic

#### **TimerService** (`src/app/services/timer.ts`)
- Provides countdown timer functionality
- Emits timer events for UI updates
- Handles timer pause/resume operations

#### **Utility Modules**
- **DomHelpers**: Cross-browser DOM manipulation utilities
- **ChallengeHelpers**: Challenge-specific validation and processing
- **StorageHelpers**: Local storage abstraction layer

### Data Models

- **Challenge**: Base interface for all challenge types
- **MultipleChoiceChallenge**: Extends Challenge for question-based challenges
- **ImageSelectionChallenge**: Extends Challenge for image-based verification

## 🎯 Usage Examples

### Basic Implementation

```typescript
// Initialize a new challenge
const challenge = await this.challengeService.getRandomChallenge();

// Start the timer
this.timerService.startTimer(challenge.timeLimit);

// Handle challenge completion
onChallengeComplete(result: boolean) {
  this.timerService.stopTimer();
  this.navigateToResults(result);
}
```

### Custom Challenge Types

```typescript
// Extend base Challenge interface
interface CustomChallenge extends Challenge {
  customProperty: string;
  validate(userInput: any): boolean;
}
```

## 🧪 Development

### Code Style Guidelines

- Follow Angular Style Guide conventions
- Use TypeScript strict mode
- Implement proper error handling
- Write unit tests for all services
- Use meaningful component and variable names

### Running Tests

```bash
# Unit tests
ng test

# End-to-end tests
ng e2e

# Test coverage
ng test --code-coverage
```

### Linting

```bash
ng lint
```

## 🚢 Deployment

### Docker Deployment

```dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build --prod

FROM nginx:alpine
COPY --from=builder /app/dist/capchat /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Configuration

Create environment-specific configuration files:

```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.example.com',
  challengeTimeout: 30000
};
```

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Write tests** for new functionality
3. **Follow coding standards** and run linting
4. **Submit a pull request** with a clear description of changes

### Commit Message Format

```
type(scope): subject

body

footer
```

Example:
```
feat(challenge): add new puzzle challenge type

Implemented jigsaw puzzle challenge with drag-and-drop functionality.
Includes timer integration and responsive design.

Closes #123
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🐛 Issues and Support

- **Bug Reports**: Use the GitHub Issues tab
- **Feature Requests**: Submit via GitHub Issues with the "enhancement" label
- **Documentation**: Check the `/docs` folder for additional information

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with basic CAPTCHA functionality
- Image selection and multiple-choice challenges
- Timer system implementation
- Responsive design

---

**Built with ❤️ using Angular and TypeScript**