# Attendance Tracker 🎓

A sleek, mobile-responsive React application designed to help students track their academic attendance, manage custom timetables, and monitor projected attendance percentages throughout the semester. 

The app runs entirely in your browser, using `localStorage` to keep your data perfectly private and instantly accessible without needing a backend or database.

## ✨ Features

### 📊 Dashboard & Analytics
* **Daily Tracker:** Easily mark classes as Present, Absent, or Cancelled for any given day.
* **Smart Projections:** The math engine automatically calculates your *projected* attendance by assuming you will attend all future unrecorded classes. 
* **Dynamic Color-Coding:** Subject cards automatically change color (Green, Orange, Red) based on customizable danger/warning thresholds.
* **Holiday Awareness:** The tracker automatically skips weekends and your configured institution holidays.

### 📅 Customizable Timetable
* **Visual Schedule:** A beautiful, full-screen weekly grid displaying your classes, labs, and breaks.
* **Fully Editable:** Add, edit, or delete classes directly on the grid.
* **Auto-Room Extraction:** Simply type a room in brackets (e.g., `DSA lab[A103G]`), and the app will format it into a neat visual pill.
* **Smart Spanning:** Classes that take up multiple time slots automatically stretch across the grid.

### ⚙️ Powerful Settings
* **Term Limits:** Set your specific semester start and end dates.
* **Slot Management:** Add, delete, and reorder vertical time slots to match your exact bell schedule.
* **Holiday Manager:** Add custom college holidays to ensure they aren't counted against your attendance.
* **Threshold Control:** Choose exactly what percentages trigger your "Warning" and "Danger" alerts.

## 🛠️ Tech Stack
* **Framework:** [React 18](https://react.dev/) (using Vite)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Icons:** [Lucide React](https://lucide.dev/)
* **State Management:** React Hooks (`useState`, `useMemo`, `useEffect`) + `localStorage`

## 🚀 Installation & Setup

1. **Clone or Download the Repository**
2. **Install Dependencies:**
   Open your terminal in the project folder and run:
   ```bash
   npm install