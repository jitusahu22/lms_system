# MiniLMS - AI Powered Learning Management System

MiniLMS is a modern, lightweight, and responsive Learning Management System designed to empower both students and instructors. It leverages AI to generate engaging quizzes automatically, features a beautiful user interface, and tracking progression built-in.

## 🚀 Features

### For Students
- **Course Enrollment**: Easily browse and enroll in new courses.
- **Progress Tracking**: Visual indicators of completion rates as you navigate lessons.
- **AI Quizzes**: Test your knowledge on lessons with dynamically generated AI practice questions.
- **Certification**: Secure and download certificates upon reaching 100% completion.

### For Instructors
- **Course Management**: Quickly scaffold new courses and modular lessons using an intuitive builder.
- **Analytics Dashboard**: Get a bird's-eye view of aggregate student progress and enrollments.
- **AI Quiz Generation**: Let Gemini AI instantly formulate multiple-choice questions for your lessons, and save them as mandatory quizzes.

### System-wide
- **Elegant UI/UX**: Built with modern CSS (glassmorphism, subtle animations, hover effects) and structured neatly via React & Tailwind paradigms.
- **Intelligent Error Handling**: A universal frontend notification system ensures you are always informed of successes and API failures.
- **Role-based Auth**: Secure access partitions depending on user type.

## 🛠 Tech Stack

**Frontend:**
- React.js (Vite)
- React Router DOM
- Axios (API Communication)
- React Toastify (Notifications)
- Lucide React (Icons)
- Vanilla CSS + CSS Variables for powerful theming

**Backend:**
- Django & Django REST Framework (Python)
- SQLite (or your configured DB)
- Google Gemini AI API

## 🚦 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.9+
- Gemini API Key

### Running Locally

1. **Clone the repository** (or download source)
2. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Set your API Key in .env
   # GEMINI_API_KEY=your_key_here
   
   python manage.py migrate
   python manage.py runserver
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   Open your browser to the local port Vite provided (usually `http://localhost:5173`).

---
_Designed as a polished and professional LMS solution with AI capabilities._
