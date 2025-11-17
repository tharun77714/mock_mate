# AI Resume Analyzer - Complete Project Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Features Implemented](#features-implemented)
4. [Project Structure](#project-structure)
5. [Core Functionality](#core-functionality)
6. [Components Breakdown](#components-breakdown)
7. [Routes & Pages](#routes--pages)
8. [API Integrations](#api-integrations)
9. [Setup Instructions](#setup-instructions)
10. [How It Works](#how-it-works)

---

## 🎯 Project Overview

**AI Resume Analyzer** is a full-stack web application that helps job seekers analyze and improve their resumes using AI-powered feedback. The application provides ATS (Applicant Tracking System) scoring, detailed resume analysis, and AI-assisted resume enhancement capabilities.

### What This Project Does

- **Resume Upload & Storage**: Users can upload PDF resumes that are securely stored in the cloud
- **AI-Powered Analysis**: Resumes are analyzed against job descriptions to provide comprehensive feedback
- **ATS Scoring**: Calculates how well a resume will perform in Applicant Tracking Systems
- **Detailed Feedback**: Provides scores and tips across multiple categories (ATS, Content, Structure, Skills, Tone & Style)
- **Resume Enhancement**: AI-powered resume improvement tool that asks questions and generates enhanced versions
- **Visual Resume Display**: Converts PDFs to images for easy viewing
- **Customizable UI**: Color customization options for personalized experience

---

## 🛠 Technology Stack

### Frontend Framework
- **React 19.1.0** - Modern UI library for building interactive interfaces
- **React Router v7** - Client-side routing with data loaders and error boundaries
- **TypeScript 5.8.3** - Type-safe JavaScript for better code quality
- **Vite 6.3.3** - Fast build tool and development server

### Styling
- **Tailwind CSS 4.1.4** - Utility-first CSS framework
- **Custom CSS** - Additional styling for gradients, animations, and glassmorphism effects

### State Management
- **Zustand 5.0.6** - Lightweight state management library

### Backend Services
- **Puter.js** - Serverless backend platform providing:
  - Authentication (OAuth-based sign-in/sign-out)
  - File storage (upload, read, delete files)
  - Key-Value database (store resume metadata)
  - AI services (Claude AI for resume analysis)

### AI Services
- **Groq API** - Fast LLM API using `llama-3.1-70b-versatile` model for:
  - Generating improvement questions
  - Enhancing resume content
- **Claude AI (via Puter.js)** - Advanced AI for resume analysis and feedback

### PDF Processing
- **pdfjs-dist 5.3.93** - PDF.js library for:
  - Converting PDF pages to images
  - Extracting text from PDF documents

### File Handling
- **react-dropzone 14.3.8** - Drag-and-drop file upload component

### Utilities
- **clsx** - Conditional class name utility
- **tailwind-merge** - Merge Tailwind CSS classes intelligently

---

## ✨ Features Implemented

### 1. Authentication System
- ✅ OAuth-based authentication via Puter.js
- ✅ Sign in/Sign out functionality
- ✅ Protected routes with automatic redirects
- ✅ User session management
- ✅ Persistent authentication state

### 2. Resume Upload & Management
- ✅ Drag-and-drop file upload interface
- ✅ PDF file validation
- ✅ Automatic PDF to image conversion
- ✅ Cloud storage via Puter.js file system
- ✅ Resume metadata storage (company name, job title, job description)
- ✅ Unique resume ID generation (UUID)

### 3. AI Resume Analysis
- ✅ Job-specific resume analysis
- ✅ Multi-category scoring system:
  - Overall Score (0-100)
  - ATS Score (0-100)
  - Content Score (0-100)
  - Structure Score (0-100)
  - Skills Score (0-100)
  - Tone & Style Score (0-100)
- ✅ Detailed feedback with tips categorized as "good" or "improve"
- ✅ Explanations for each feedback point
- ✅ JSON-structured AI responses

### 4. Resume Display & Review
- ✅ Visual resume preview (PDF converted to image)
- ✅ PDF viewer with download capability
- ✅ Side-by-side feedback display
- ✅ Color-customizable UI themes
- ✅ Responsive design for mobile and desktop
- ✅ Animated loading states

### 5. Resume Enhancement Tool
- ✅ AI-generated improvement questions based on feedback
- ✅ Interactive Q&A form for user input
- ✅ AI-powered resume enhancement using Groq API
- ✅ Enhanced resume generation with better:
  - Structure and organization
  - Content improvements
  - Professional formatting
  - Action verbs and quantifiable achievements
- ✅ Download enhanced resume as text file
- ✅ Ability to enhance multiple times

### 6. Dashboard & Resume Management
- ✅ Homepage dashboard showing all uploaded resumes
- ✅ Resume cards with key information
- ✅ Quick navigation to resume details
- ✅ Empty state handling
- ✅ Loading states and animations

### 7. UI/UX Features
- ✅ Modern glassmorphism design
- ✅ Gradient borders and backgrounds
- ✅ Custom color theming
- ✅ Smooth animations and transitions
- ✅ Responsive layout (mobile, tablet, desktop)
- ✅ Loading indicators
- ✅ Error handling and user feedback
- ✅ Icon-based visual feedback (checkmarks, warnings)

---

## 📁 Project Structure

```
ai-resume-analyzer/
├── app/
│   ├── components/          # Reusable UI components
│   │   ├── Accordion.tsx    # Collapsible content sections
│   │   ├── ATS.tsx          # ATS score display component
│   │   ├── ColorCustomizer.tsx  # UI color theme picker
│   │   ├── Details.tsx      # Detailed feedback display
│   │   ├── FileUploader.tsx # Drag-and-drop file upload
│   │   ├── Navbar.tsx       # Navigation bar
│   │   ├── ResumeCard.tsx   # Resume card for dashboard
│   │   ├── ScoreBadge.tsx   # Score display badge
│   │   ├── ScoreCircle.tsx  # Circular score indicator
│   │   ├── ScoreGauge.tsx   # Gauge-style score display
│   │   └── Summary.tsx      # Feedback summary component
│   ├── lib/                 # Core libraries and utilities
│   │   ├── gemini.ts        # Groq API integration (resume enhancement)
│   │   ├── pdf2img.ts       # PDF to image conversion
│   │   ├── pdf2text.ts      # PDF text extraction
│   │   ├── puter.ts         # Puter.js state management (Zustand store)
│   │   └── utils.ts         # Utility functions (UUID generation, etc.)
│   ├── routes/              # Application routes/pages
│   │   ├── auth.tsx         # Authentication page
│   │   ├── enhance.tsx      # Resume enhancement page
│   │   ├── home.tsx         # Dashboard/homepage
│   │   ├── resume.tsx       # Resume review page
│   │   ├── upload.tsx       # Resume upload page
│   │   └── wipe.tsx         # Data cleanup utility
│   ├── app.css              # Global styles
│   ├── root.tsx             # Root component
│   └── routes.ts            # Route configuration
├── constants/
│   └── index.ts             # AI prompt templates and constants
├── types/
│   ├── index.d.ts           # TypeScript type definitions
│   └── puter.d.ts           # Puter.js type definitions
├── public/
│   ├── icons/               # SVG icons
│   ├── images/              # Image assets
│   └── pdf.worker.min.mjs   # PDF.js worker file
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── react-router.config.ts   # React Router configuration
├── Dockerfile               # Docker containerization
└── README.md                # This file
```

---

## 🔧 Core Functionality

### 1. Puter.js Integration (`app/lib/puter.ts`)

A comprehensive Zustand store that manages all Puter.js interactions:

**Authentication:**
- `auth.signIn()` - Sign in user
- `auth.signOut()` - Sign out user
- `auth.checkAuthStatus()` - Check if user is authenticated
- `auth.getUser()` - Get current user information
- `auth.refreshUser()` - Refresh user data

**File System:**
- `fs.upload()` - Upload files to cloud storage
- `fs.read()` - Read files from cloud storage
- `fs.write()` - Write files to cloud storage
- `fs.delete()` - Delete files
- `fs.readDir()` - List directory contents

**Key-Value Storage:**
- `kv.set()` - Store key-value pairs
- `kv.get()` - Retrieve values by key
- `kv.delete()` - Delete keys
- `kv.list()` - List keys matching pattern
- `kv.flush()` - Clear all data

**AI Services:**
- `ai.chat()` - General AI chat
- `ai.feedback()` - Get resume feedback from Claude AI
- `ai.img2txt()` - Image to text conversion

### 2. PDF Processing

**PDF to Image Conversion (`app/lib/pdf2img.ts`):**
- Converts first page of PDF to PNG image
- High-quality rendering (4x scale)
- Returns File object and image URL
- Used for visual resume preview

**PDF Text Extraction (`app/lib/pdf2text.ts`):**
- Extracts all text from PDF document
- Processes all pages
- Returns plain text string
- Used for AI analysis and enhancement

### 3. Groq API Integration (`app/lib/gemini.ts`)

**Functions:**
- `callGroqAPI()` - Main API call function using OpenAI-compatible format
- `generateQuestions()` - Generates 5-7 improvement questions based on resume and feedback
- `enhanceResume()` - Creates enhanced resume version using user answers

**Model:** `llama-3.1-70b-versatile` (fast and powerful)

**Configuration:**
- Requires `VITE_GROQ_API_KEY` in `.env` file
- Temperature: 0.7
- Max tokens: 4096

### 4. AI Feedback System (`constants/index.ts`)

**Feedback Structure:**
```typescript
interface Feedback {
  overallScore: number;        // 0-100
  ATS: {
    score: number;              // 0-100
    tips: Array<{
      type: "good" | "improve";
      tip: string;
    }>;
  };
  toneAndStyle: {
    score: number;
    tips: Array<{
      type: "good" | "improve";
      tip: string;
      explanation: string;
    }>;
  };
  content: { /* same structure */ };
  structure: { /* same structure */ };
  skills: { /* same structure */ };
}
```

**AI Prompt:**
- Analyzes resume against job description
- Provides thorough, honest feedback
- Returns structured JSON response
- Uses Claude AI via Puter.js

---

## 🧩 Components Breakdown

### Navigation Components

**Navbar (`app/components/Navbar.tsx`)**
- Displays user information
- Sign out functionality
- Responsive design

### Resume Display Components

**ResumeCard (`app/components/ResumeCard.tsx`)**
- Displays resume preview on dashboard
- Shows company name, job title, and score
- Clickable card navigation

**Summary (`app/components/Summary.tsx`)**
- Overall score display
- Key metrics visualization
- Color-customizable

**ATS (`app/components/ATS.tsx`)**
- ATS score with visual indicators
- Good/warning/bad icons based on score
- Improvement suggestions list

**Details (`app/components/Details.tsx`)**
- Comprehensive feedback breakdown
- Accordion-style sections
- Expandable tips with explanations

**ScoreBadge, ScoreCircle, ScoreGauge**
- Various score visualization components
- Color-coded based on performance

### Interactive Components

**FileUploader (`app/components/FileUploader.tsx`)**
- Drag-and-drop interface
- File validation
- Visual feedback

**ColorCustomizer (`app/components/ColorCustomizer.tsx`)**
- Color picker for UI theming
- Real-time preview
- Customizable primary, secondary, accent, and background colors

**Accordion (`app/components/Accordion.tsx`)**
- Collapsible content sections
- Smooth animations

---

## 🗺 Routes & Pages

### `/` - Homepage (Dashboard)
**File:** `app/routes/home.tsx`

**Features:**
- Lists all uploaded resumes
- Resume cards with navigation
- Empty state with upload prompt
- Loading states

**Functionality:**
- Fetches resumes from KV store using pattern `resume:*`
- Parses and displays resume data
- Redirects to auth if not authenticated

### `/auth` - Authentication
**File:** `app/routes/auth.tsx`

**Features:**
- Sign in/Sign out interface
- OAuth integration via Puter.js
- Redirect handling with `next` parameter
- Loading states

**Functionality:**
- Checks authentication status
- Redirects authenticated users
- Handles sign in/sign out actions

### `/upload` - Resume Upload
**File:** `app/routes/upload.tsx`

**Features:**
- Job application form (company, title, description)
- File upload interface
- Processing status indicators
- Animated loading states

**Functionality:**
1. User fills form and uploads PDF
2. File uploaded to Puter.js storage
3. PDF converted to image
4. Image uploaded to storage
5. Resume metadata stored in KV store
6. AI analysis triggered via Puter.js Claude AI
7. Feedback stored and user redirected to review page

### `/resume/:id` - Resume Review
**File:** `app/routes/resume.tsx`

**Features:**
- Side-by-side resume and feedback display
- Visual resume preview
- Comprehensive feedback sections
- Color customization
- "Enhance Resume" button

**Functionality:**
- Loads resume data from KV store
- Displays PDF as image
- Shows all feedback categories
- Customizable color theme
- Navigation to enhancement page

### `/resume/:id/enhance` - Resume Enhancement
**File:** `app/routes/enhance.tsx`

**Features:**
- Multi-step enhancement process
- AI-generated questions
- Interactive Q&A form
- Enhanced resume display
- Download functionality

**Functionality:**
1. **Loading Step:** Extracts text from PDF, collects pros/cons from feedback
2. **Questions Step:** Generates improvement questions using Groq API
3. **Enhancing Step:** User answers questions, AI enhances resume
4. **Complete Step:** Displays enhanced resume, allows download

**Enhancement Process:**
- Extracts resume text from PDF
- Analyzes feedback to identify pros and cons
- Generates contextual questions
- User provides answers
- AI creates enhanced version with:
  - Better structure
  - Improved content
  - Professional formatting
  - Enhanced achievements

### `/wipe` - Data Cleanup
**File:** `app/routes/wipe.tsx`

**Utility route for clearing all stored data (development/testing)**

---

## 🔌 API Integrations

### Puter.js Platform

**Authentication:**
- OAuth-based sign-in
- No backend required
- Secure session management

**Storage:**
- Cloud file storage
- Automatic file management
- Direct file access URLs

**Database:**
- Key-value store
- Pattern-based queries
- Persistent data storage

**AI Services:**
- Claude AI integration
- File-based analysis
- Structured JSON responses

### Groq API

**Endpoint:** `https://api.groq.com/openai/v1/chat/completions`

**Model:** `llama-3.1-70b-versatile`

**Use Cases:**
- Generating improvement questions
- Resume content enhancement
- Natural language processing

**Configuration:**
- Environment variable: `VITE_GROQ_API_KEY`
- Temperature: 0.7
- Max tokens: 4096

---

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **Git** (for cloning repository)

### Installation Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ai-resume-analyzer
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   
   Create a `.env` file in the `ai-resume-analyzer` directory:
   ```env
   VITE_GROQ_API_KEY=your_groq_api_key_here
   ```
   
   To get a Groq API key:
   - Visit https://console.groq.com/keys
   - Sign up or log in
   - Create a new API key
   - Copy and paste it into `.env`

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Navigate to `http://localhost:5173`
   - The app will automatically initialize Puter.js
   - Sign in when prompted

### Building for Production

```bash
npm run build
npm start
```

### Type Checking

```bash
npm run typecheck
```

---

## 🔄 How It Works

### Complete User Flow

1. **Authentication:**
   - User visits the app
   - Puter.js initializes
   - User signs in via OAuth
   - Session is established

2. **Resume Upload:**
   - User navigates to `/upload`
   - Fills in job details (company, title, description)
   - Uploads PDF resume
   - File is processed:
     - PDF uploaded to cloud storage
     - First page converted to PNG image
     - Image uploaded to cloud storage
     - Resume metadata stored in KV database

3. **AI Analysis:**
   - Resume PDF sent to Claude AI via Puter.js
   - AI analyzes resume against job description
   - Structured feedback generated (scores + tips)
   - Feedback stored in KV database
   - User redirected to review page

4. **Resume Review:**
   - Resume image displayed
   - Feedback shown in organized sections:
     - Overall score
     - ATS score with tips
     - Content, Structure, Skills, Tone & Style scores
   - User can customize colors
   - Option to enhance resume

5. **Resume Enhancement:**
   - Text extracted from PDF
   - Pros and cons collected from feedback
   - AI generates 5-7 improvement questions
   - User answers questions
   - Groq API enhances resume based on:
     - Original resume text
     - Feedback pros/cons
     - User's answers
   - Enhanced resume displayed
   - User can download or enhance again

### Data Flow

```
User Upload → Puter.js Storage → PDF Processing
                                      ↓
                              Image Conversion
                                      ↓
                              KV Database (Metadata)
                                      ↓
                              Claude AI Analysis
                                      ↓
                              KV Database (Feedback)
                                      ↓
                              Display Review Page
                                      ↓
                              (Optional) Enhancement
                                      ↓
                              Groq API Processing
                                      ↓
                              Enhanced Resume
```

### Storage Structure

**KV Store Keys:**
- `resume:{uuid}` - Stores complete resume data:
  ```json
  {
    "id": "uuid",
    "resumePath": "/path/to/resume.pdf",
    "imagePath": "/path/to/resume.png",
    "companyName": "Company",
    "jobTitle": "Position",
    "jobDescription": "Description",
    "feedback": { /* Feedback object */ }
  }
  ```

**File Storage:**
- PDF files stored in Puter.js cloud
- Image files stored in Puter.js cloud
- Accessible via file paths

---

## 🎨 Design Features

### Visual Design
- **Glassmorphism:** Frosted glass effects with backdrop blur
- **Gradient Borders:** Animated gradient borders
- **Dark Theme:** Modern dark color scheme
- **Custom Colors:** User-customizable theme colors
- **Smooth Animations:** Fade-in, slide animations
- **Responsive Layout:** Mobile-first design

### User Experience
- **Loading States:** Clear progress indicators
- **Error Handling:** User-friendly error messages
- **Empty States:** Helpful prompts when no data
- **Visual Feedback:** Icons, colors, animations
- **Intuitive Navigation:** Clear user flow

---

## 📝 Key Technical Decisions

1. **Puter.js for Backend:** Eliminates need for custom backend, provides auth, storage, and AI
2. **Zustand for State:** Lightweight, no context providers needed
3. **React Router v7:** Modern routing with data loaders
4. **TypeScript:** Type safety throughout the application
5. **PDF.js:** Client-side PDF processing, no server required
6. **Groq API:** Fast LLM for enhancement features
7. **Claude AI:** High-quality resume analysis via Puter.js

---

## 🔐 Security Considerations

- API keys stored in environment variables (frontend-accessible for Vite)
- **Note:** For production, consider using a backend proxy for API keys
- Puter.js handles authentication securely
- File storage is user-specific and private
- No sensitive data stored in client-side code

---

## 🐛 Troubleshooting

### Groq API Issues
- Verify `VITE_GROQ_API_KEY` is set in `.env`
- Restart dev server after changing `.env`
- Check API key validity at https://console.groq.com/keys
- Check browser console for detailed error messages

### Puter.js Issues
- Ensure Puter.js script loads (check browser console)
- Verify authentication status
- Check network connectivity

### PDF Processing Issues
- Ensure PDF files are valid
- Check browser console for PDF.js errors
- Verify `pdf.worker.min.mjs` is accessible

---

## 📚 Additional Resources

- **Puter.js Documentation:** https://docs.puter.com/
- **Groq API Documentation:** https://console.groq.com/docs
- **React Router v7 Docs:** https://reactrouter.com/
- **PDF.js Documentation:** https://mozilla.github.io/pdf.js/

---

## 🎯 Future Enhancements

Potential improvements:
- Multiple resume versions management
- Export enhanced resume as PDF
- Resume comparison tool
- Job application tracking
- Resume templates
- Batch resume analysis
- Integration with job boards
- Advanced analytics dashboard

---

## 📄 License

This project is part of a tutorial/educational resource.

---

**Built with ❤️ using React, TypeScript, Puter.js, and AI**
