# TourTracker

## Overview

TourTracker is an Angular-based web application for SWEN2 that allows users to plan, track, and manage hiking, cycling, running, and walking tours. Users can create tours, log their experiences, track route information, and manage tour details through an intuitive interface.

## Key Features

- **Tour Management**: Create, read, update, and delete tours
- **Tour Logging**: Record actual tour experiences with distance, time, difficulty, and notes
- **User Authentication**: Login and registration system with token-based authentication
- **Map Integration**: Display tours on a regional map with tour markers
- **User Profiles**: Account settings and profile management
- **Dark Mode Support**: Toggle between light and dark themes

## Project Structure

```
TourTracker/
├── src/
│   ├── app/                    # Main Angular application
│   │   ├── app.component.ts   # Root component
│   │   ├── app.routes.ts      # Application routing
│   │   ├── app.config.ts      # Angular configuration
│   │   └── pages/             # Page components
│   │       ├── home/          # Main home page with tour list and map
│   │       ├── login/         # User login page
│   │       ├── register/      # User registration page
│   │       ├── settings/      # Application settings
│   │       ├── account/       # User account management
│   │       └── tour-details/  # Detailed tour view with logs
│   │       └── toast-messages/ # Reusable web-UI component
│   ├── models/                # TypeScript interfaces
│   │   ├── tour.model.ts      # Tour and TourLog interfaces
│   │   └── user.model.ts      # User and AuthResponse interfaces
│   ├── services/              # Angular services
│   │   ├── auth.service.ts    # Authentication and user management
│   │   ├── tour.service.ts    # Tour CRUD operations and management
|   |   ├── toast.service.ts   # Error and success messages as toast notification
│   │   ├── user.service.ts    # User profile management
│   │   ├── map.service.ts     # Map API integration
│   │   └── storage.service.ts # Local storage persistence
│   └── styles.scss            # Global styles
├── documents/                 # Documentation and diagrams
│   ├── diagrams/              # Visual diagrams and wireframes
│   ├── documentation.md       # This file
│   ├── semester-project-1.pdf # Project requirements
│   └── TourPlanner_Checklist_Intermediate.xlsx
├── public/                    # Static assets
├── package.json               # Project dependencies
└── angular.json               # Angular configuration
```

## Data Models

### Tour Interface

```typescript
interface Tour {
  id: string;
  name: string;
  selectedImage: string;
  description: string;
  from: string;                    // Starting location
  to: string;                      // Destination
  transportType: 'hiking' | 'cycling' | 'running' | 'walking' | '';
  distance: string;                // Planned distance
  time: string;                    // Estimated time
  logs: TourLog[];                 // Array of tour execution logs
}
```

### TourLog Interface

```typescript
interface TourLog {
  id: string;
  tourId: string;
  date: Date;
  startTime: string;
  endTime: string;
  actualDistance: number;
  difficulty: number;              // Scale 1-10
  totalTime: string;
  rating: number;                  // User satisfaction rating
  notes: string;                   // User notes/observations
}
```

### User Interface

```typescript
interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface AuthResponse {
  user: User;
  token: string;
}
```

## Core Services

### AuthService
Manages user authentication, login, registration, and dark mode preferences.

**Key Methods:**
- `login(username, password)` - Authenticate user
- `register(userData)` - Create new user account
- `logout()` - End user session
- `getDarkMode()` - Get dark mode preference signal

### TourService
Handles all tour-related operations with signal-based state management.

**Key Methods:**
- `getTours()` - Retrieve all tours
- `getTour(id)` - Get specific tour details
- `createTour(tour)` - Create new tour
- `updateTour(tour)` - Update existing tour
- `deleteTour(id)` - Remove tour
- `addTourLog(tourId, log)` - Add execution log to tour

### StorageService
Manages persistent data storage using browser localStorage.

**Key Methods:**
- `getTours()` - Retrieve stored tours
- `saveTours(tours)` - Persist tours
- `getUser()` - Retrieve user data
- `saveUser(user)` - Persist user data

### MapService
Integrates with mapping APIs to display tours on maps.

**Key Methods:**
- `getTourRoute(from, to)` - Get route coordinates
- `displayMap(element, route)` - Render map with route
- `addMarkers(tours)` - Add tour markers to map

### UserService
Manages user profile and account information.

**Key Methods:**
- `getProfile()` - Get current user profile
- `updateProfile(updates)` - Update user information
- `uploadAvatar(file)` - Update profile picture

### ToastService
Error and success messages show as toast notifications.

**Key Methods:**
- `show(message, isError, duration)` - Shows respective notification
- `remove(id)` - Removes message again after duration is over

## Routing

```
/                    → Home (tour list + map)
/login              → Login page
/register           → Registration page
/account            → User account management
/settings           → Application settings
/tour/:id           → Tour details and logs view
**                  → Redirect to home (catch-all)
```

## Key UI Components

### Home Page
- **Tour List Sidebar**: Displays all tours with search/filter functionality
- **Map Display**: Central area showing regional map with tour pins
- **Tour Card**: Shows key tour information (name, distance, time, transport type)
- **Create Tour Button**: Floating action button for creating new tours

### Tour Details Page
- **Tour Information Panel**: Name, image, starting point, destination, distance, time
- **Route Map**: Detailed map showing the planned route
- **Tour Logs Section**: Scrollable list of past tour executions
- **Editing Controls**: Pencil icon to edit tour
- **Actions**: Edit and Delete button

### User Authentication Pages
- **Login Page**: Email/username and password input with login button
- **Register Page**: Form for creating new account
- **Account Page**: User profile management with avatar
- **Settings Page**: Application preferences (dark mode, notifications, etc.)

### Toast Messages Notification (Reusable web-UI component)
- **Notification**: Pops up in its respective color for a certain time to show the error or success
- **Reusable web-UI component**: Reusable for every error or success message

## Technology Stack

### Frontend Framework
- **Angular**: Version 21.1.0 - Modern component-based framework
- **TypeScript**: Version 5.9.2 - Type-safe JavaScript
- **RxJS**: Version 7.8.0 - Reactive programming library
- **Angular Signals**: For state management and reactivity

### UI & Styling
- **TailwindCSS**: Version 3.4.1 - Utility-first CSS framework
- **SCSS**: Preprocessor for advanced styling
- **Lucide Angular**: Version 0.577.0 - Icon library

### Build & Development
- **Angular CLI**: Version 21.1.4 - Development and build tools
- **Vite**: Used for optimized builds

## Development Setup

### Prerequisites
- Node.js with npm 11.9.0
- Angular CLI 21.1.4

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Development Server
```bash
ng serve
```
Access the application at `http://localhost:4200/`

## State Management

TourTracker uses **Angular Signals** for reactive state management:

- **Signal Pattern**: Simplified signals with `signal()` function
- **Computed Values**: Derived state using `computed()`
- **Effects**: Automatic side effects with `effect()`
- **Persistence**: LocalStorage integration via StorageService

### Example State Pattern
```typescript
private tours = signal<Tour[]>([]);
public allTours = this.tours.asReadonly();

updateTour(tour: Tour) {
  this.tours.update(current => 
    current.map(t => t.id === tour.id ? tour : t)
  );
  this.storage.saveTours(this.tours());
}
```

## Best Practices

### Code Organization
- Standalone components by default
- Minimal component coupling
- Single responsibility principle
- OnPush change detection strategy

### Performance
- Lazy loading for feature routes
- OnPush change detection on all components
- Signals for efficient reactivity
- Optimized bundle size

## Future Enhancements

### Planned Features
- Weather API integration for route conditions (BONUS)
- Elevation data from terrain APIs
- Advanced filtering and search
- Tour difficulty ratings
- Photo integration for tours

## Testing

### Unit Tests
```bash
npm run test
```

### Running Tests
- TDD approach for new features
- Component and service unit tests
- Mock HTTP services

## Deployment

### Build for Production
```bash
npm run build
```

## File Naming Conventions

- **Components**: `*.component.ts`, `*.component.html`, `*.component.scss`
- **Services**: `*.service.ts`
- **Models**: `*.model.ts`
- **Interfaces**: Named in model files





This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.1.4.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
