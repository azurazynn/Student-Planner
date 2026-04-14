# 📚 Student Planner

A mobile productivity app for students built with **React Native** and **Expo**. Manage tasks, track your schedule, and monitor your grades — all in one place.

---

## ✨ Features

- **Dashboard** — At-a-glance overview of your tasks and upcoming schedule
- **Task Management** — Create, view, and manage tasks with detail screens
- **Schedule** — Organize your subjects and class schedules
- **Grades Tracker** — Track your GWA (General Weighted Average) per subject with easy input and clearing

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | [React Native](https://reactnative.dev/) + [Expo](https://expo.dev/) |
| Navigation | Expo Router (Tab + Stack navigation) |
| Backend | [Supabase](https://supabase.com/) |
| State Management | React Context API (`AppContext`) |

---

## 📦 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- A [Supabase](https://supabase.com/) project

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/azurazynn/Student-Planner.git
cd Student-Planner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Supabase

Create a `.env` file (or update `utils/supabaseClient.js`) with your Supabase project credentials:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 4. Set up the database

Make sure your Supabase project has the following tables, all scoped by `user_id`:

- `tasks` — stores student tasks
- `schedule` — stores class/subject schedule entries (also used to derive grade data)

> **Note:** Grade data is derived from the `schedule` table rather than a separate `grades` table. Each schedule entry holds a `gwa` field for the subject's General Weighted Average.

### 5. Run the app

```bash
npx expo start
```

Scan the QR code with [Expo Go](https://expo.dev/client) on your device, or press `i` / `a` to open in an iOS/Android simulator.

---

## 🗂 Project Structure

```
Student-Planner/
├── constants/
│   └── Colors.ts             # App color constants
├── navigation/
│   └── AppNavigator.tsx      # Root navigation setup
├── screens/
│   ├── AddClassScreen.tsx    # Add a new class/subject
│   ├── AddTaskScreen.tsx     # Add a new task
│   ├── DashboardScreen.tsx   # Home dashboard
│   ├── GradesScreen.tsx      # GWA tracker
│   ├── HomeScreen.js         # Home entry screen
│   ├── LoginScreen.tsx       # User login
│   ├── ProfileScreen.tsx     # User profile
│   ├── ScheduleScreen.tsx    # Class schedule
│   ├── SignUpScreen.tsx      # User registration
│   ├── SplashScreen.tsx      # Splash/loading screen
│   ├── TaskDetailScreen.tsx  # Task detail view
│   └── TasksScreen.tsx       # Task list
├── types/
│   └── navigation.ts         # Navigation type definitions
├── utils/
│   ├── storage.ts            # Local storage helpers
│   └── supabaseClient.js     # Supabase client setup
├── App.js                    # App entry point
└── app.json                  # Expo config
```

---

## 📱 Screens

### Splash / Login / Sign Up
Authentication flow — users land on the splash screen, then log in or register via Supabase Auth.

### Dashboard
Overview of pending tasks and upcoming schedule entries.

### Tasks & Task Detail
Full task list with the ability to tap into `TaskDetailScreen` for viewing and editing individual tasks.

### Schedule & Add Class
View your class schedule and add new subjects/classes via `AddClassScreen`.

### Grades
Track your GWA per subject. Includes a unified GWA input field per subject and a trash icon to clear grades.

### Profile
View and manage your student profile.

---

## 🔐 Authentication

User authentication is handled via Supabase Auth. All data (tasks, schedule, grades) is scoped per `user_id` to keep each student's data private.

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
