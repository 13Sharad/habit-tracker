````markdown
# Habit Tracker

A Next.js & MongoDB app for tracking daily habits, complete with secure authentication and streak monitoring.

## 🔑 Features

- **Custom Auth**  
  Email/password signup & login with JWT; passwords hashed via bcrypt.  

- **Daily Habits**  
  Create, view, and delete habits with optional descriptions and reminders.  

- **Streak System**  
  One “mark done” per habit per 24 h — consecutive completes grow your streak; a miss resets it.  

- **Dashboard**  
  Shows active habits, today’s completion (blue highlight), and current streaks.  

- **Persistence & Validation**  
  All data in MongoDB Atlas; API checks fields and returns clear success/error messages.

## 🚀 Tech Stack

- **Frontend:** Next.js (React), Tailwind CSS  
- **Backend:** Node.js, Express, JWT authentication  
- **Database:** MongoDB Atlas  
- **Security:** bcrypt password hashing, JWT‑protected routes  

## ⚙️ Installation

1. **Clone the repo**  
   ```bash
   git clone https://github.com/your-username/habit-tracker.git
   cd habit-tracker
````

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**
   Create a `.env.local` file in the project root:

   ```ini
   MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
   JWT_SECRET=YOUR_SECRET_KEY
   ```

4. **Run locally**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

> Enjoy building better habits! 🚀

```
```
