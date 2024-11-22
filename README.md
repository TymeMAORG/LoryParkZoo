
# Lory Park Zoo Management App

## Overview

The **Lory Park Zoo Management App** is a React Native application designed to assist zookeepers in managing daily tasks for different animal groups. This includes monitoring food intake, health status, and daily activities. The app integrates with Firebase for real-time data storage and retrieval, allowing users to dynamically interact with information about animals.

## Features

- **Animal Group Management**:
  - Manage animals from groups such as Big Cats, Birds of Prey, Primates, and Reptiles.
  - View grouped animals by family or section.
  - Add, edit, and update animal details.

- **Daily Food Monitoring**:
  - Record food intake for each animal dynamically.
  - Save and edit daily feeding records.
  - Log temperature and other relevant details.

- **Task Management**:
  - Create, edit, and reorder tasks for zookeepers.
  - Tasks are grouped into **To-Do**, **Doing**, and **Done** sections.

- **Firebase Integration**:
  - Real-time database for storing and retrieving animal records, feeding details, and task lists.
  - Data structure aligns with zoo-specific needs.

## Project Structure

```
/app
  ├── /(tabs)            # Main navigation tabs
  │   ├── /staff         # Staff-specific sections
  │   │   ├── /animalgroup
  │   │   │   ├── /bigcats         # Big Cats management
  │   │   │   ├── /birdsofprey     # Birds of Prey management
  │   │   │   ├── /primates        # Primates management
  │   │   │   ├── /reptiles        # Reptiles management
  │   ├── /tasks          # Task management
  ├── firebaseConfig.ts   # Firebase configuration
  ├── App.tsx             # Main application entry point
```

---

## Setup Instructions

### Prerequisites

1. **Node.js** (v14 or higher)
2. **Expo CLI**: Install via `npm install -g expo-cli`.
3. **Firebase**: A Firebase project set up with a Realtime Database.

---

### Firebase Configuration

1. In the Firebase Console:
   - Go to **Project Settings** and retrieve your Firebase configuration object.
   - Enable **Realtime Database** and set up read/write rules.

   Example Realtime Database rules:
   ```json
   {
     "rules": {
       ".read": true,
       ".write": true
     }
   }
   ```

2. Replace the placeholder in `firebaseConfig.ts`:
   ```typescript
   import { initializeApp } from "firebase/app";
   import { getDatabase } from "firebase/database";

   const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_AUTH_DOMAIN",
     databaseURL: "YOUR_DATABASE_URL",
     projectId: "YOUR_PROJECT_ID",
     storageBucket: "YOUR_STORAGE_BUCKET",
     messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
     appId: "YOUR_APP_ID",
   };

   const app = initializeApp(firebaseConfig);
   export const database = getDatabase(app);
   ```

---

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/lory-park-zoo.git
   ```

2. Navigate to the project directory:
   ```bash
   cd lory-park-zoo
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   expo start
   ```

---

## Usage

1. **Staff Login**: Select a username to personalize your view.
2. **Navigate Animal Groups**:
   - Select an animal group (e.g., Big Cats or Birds of Prey).
   - View animals grouped by family.
3. **Record Data**:
   - Enter feeding, health, and activity records dynamically.
   - Use the draggable task list to manage daily activities.
4. **Edit Existing Records**:
   - Select any saved record to update details.

---

## Data Structure

### Firebase Realtime Database

```json
{
  "animals": {
    "-UniqueID1": {
      "name": "Sky",
      "species": "Bald Eagle",
      "family": "Accipitridae",
      "section": "BirdsOfPrey",
      "status": "Healthy",
      "age": "5",
      "sex": "female",
      "health": "Healthy"
    }
  },
  "BigCats FoodMonitoring Sheet": {
    "2024-11-21": {
      "date": "2024-11-21",
      "temperature": 28,
      "foodIntake": {
        "Sky": "3/4",
        "Thor": "All"
      },
      "timestamp": "2024-11-21T10:00:00Z"
    }
  }
}
```

---

## Technologies Used

- **React Native**: Cross-platform mobile application development.
- **Expo Router**: File-based routing system for Expo.
- **Firebase**: Realtime Database for dynamic data storage.
- **TypeScript**: Strictly typed JavaScript for better code quality.

---

##  Enhancements

- **Authentication**:
  - Role-based access for staff members.
- **Notifications**:
  - Alert zookeepers about overdue tasks or feeding schedules.
- **Offline Mode**:
  - Enable data caching for offline usage.
- **Analytics Dashboard**:
  - Track animal health trends and zookeeper performance.

---

## Troubleshooting

1. **Database Connection Issues**:
   - Ensure Firebase credentials in `firebaseConfig.ts` are correct.
   - Check Realtime Database rules for read/write access.

2. **Expo Not Starting**:
   - Run `expo doctor` to debug any issues with dependencies.

3. **Missing Data**:
   - Verify the `section` field in Firebase matches the application filters.

---





