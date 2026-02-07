# Modern Time Tracker

A sophisticated, cross-platform time tracking application built for productivity enthusiasts. Seamlessly manage your time across different "Spaces", track ongoing activities in real-time, and synchronize your data across all your devices.

## 🚀 Key Features

*   **Spaces-Based Organization**: Group your time entries into customizable Spaces (e.g., Work, Study, Health) with unique colors and icons.
*   **Smart Time Tracking**: multiple ways to log time:
    *   **Duration**: Quickly log "2 hours".
    *   **Time Range**: Specify "09:00 to 11:00".
    *   **Live Timer**: Start and stop timers with real-time elapsed display.
*   **Seamless Cloud Sync**: Built on Supabase, your data stays in sync across all your devices. Start a timer on your phone and finish it on your desktop.
*   **Offline-First Architecture**: Continue tracking time without an internet connection. The app automatically reconciles and uploads your data when connectivity is restored.
*   **Cross-Device Interoperability**: "Ongoing" entries are synced in real-time, allowing for true multi-device workflows.
*   **Analytics & Insights**: Visualize your productivity with breakdowns by Space, trends over time, and detailed history.
*   **Privacy Focused**: Guest mode allows full local usage without an account. Data is only synced if you choose to sign in.
*   **Modern UI/UX**: Features a sleek glassmorphism design, dark mode support, and fluid animations.
*   **Localization**: Fully localized in English and Spanish.

## 🛠️ Tech Stack

*   **Frontend**: React 19, TypeScript, Vite
*   **Styling**: Tailwind CSS (with custom glassmorphism utilities)
*   **State Management**: React Context + Local Storage (for offline persistence)
*   **Backend / Auth**: Supabase
*   **Routing**: React Router 7
*   **Icons**: Material Symbols

## 📦 Getting Started

### Prerequisites

*   Node.js (v18 or higher)
*   A Supabase project (for cloud sync features)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Ismaeliki11/timetracker.git
    cd timetracker
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

## 🗄️ Database Schema

For the cloud sync to work, your Supabase `time_entries` table should include the following schema extensions:

```sql
alter table time_entries 
add column is_ongoing boolean default false;
```

## 📱 Mobile Support

The application is fully responsive and optimized for mobile devices, functioning as a Progressive Web App (PWA) capability for installation on home screens.

## 👨‍💻 About the Author

This application was crafted by **Ismael** as a personal portfolio project, driven by a genuine passion for building high-quality, useful software.

*   **For the Love of Art**: This project was created "por amor al arte" (for the love of art), focusing purely on user experience and technical craftsmanship rather than monetization.
*   **No Ads, No Fees**: This tool is completely free to use. There are no advertisements, no tracking, and no hidden costs.
*   **Open & Educational**: The source code is available for anyone to learn from, showcasing modern React patterns and real-time synchronization strategies.

## 📄 License

This project is shared under a **Non-Commercial License**.

You are free to **use**, **modify**, and **distribute** this software for personal or educational purposes. I encourage you to learn from it, improve it, and share it with others.

**However, you may NOT use this software for commercial purposes or sell copies of it.** This project was born from good intentions and is meant to remain a free resource for the community forever.
