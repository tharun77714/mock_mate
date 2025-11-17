
﻿# MockMate - AI-Powered Mock Interview Platform

MockMate is an intelligent web application designed to help job seekers practice technical and behavioral interviews through AI-powered voice conversations. The platform provides real-time interview simulations with comprehensive feedback, including emotion analysis to assess candidate confidence and communication effectiveness.

## 🎯 Project Overview

MockMate leverages cutting-edge AI technologies to create an immersive interview experience. Users can generate customized interview questions based on job roles, experience levels, and tech stacks, then engage in real-time voice conversations with an AI interviewer. The platform captures conversation transcripts, analyzes responses using Google's Gemini AI, and provides detailed feedback on communication skills, technical knowledge, problem-solving abilities, and more.

## ✨ Key Features

- **AI-Generated Interview Questions**: Uses AI-powered agent to generate contextual interview questions based on job requirements
- **Real-Time Voice Interviews**: Conduct interviews through natural voice conversations powered by Vapi.ai and 11labs TTS
- **Comprehensive Feedback Analysis**: AI-powered feedback on multiple assessment categories with actionable insights
- **Real-Time Emotion Detection**: Advanced facial emotion recognition to analyze confidence, engagement, and communication clarity
- **Interview History**: Track and review past interviews with detailed transcripts and feedback
- **User Authentication**: Secure authentication system using Firebase
- **Responsive Design**: Modern, vibrant UI built with Next.js and Tailwind CSS

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with React 19
- **Styling**: Tailwind CSS with custom vibrant theme
- **State Management**: React Hooks (useState, useEffect, useCallback)
- **Routing**: Next.js App Router with dynamic routes

### Backend Services
- **API Routes**: Next.js API routes for server-side logic
- **Database**: Firebase Firestore for interviews and feedback storage
- **Authentication**: Firebase Authentication
- **AI Integration**: 
  - Google Gemini 2.0 Flash for question generation and feedback analysis
  - Vapi.ai SDK for voice conversation management
  - 11labs for text-to-speech synthesis

### Emotion Detection System
- **Python Backend**: FastAPI service for emotion recognition
- **ML Model**: DeepFace library for facial emotion analysis
- **Real-Time Processing**: Webcam frame capture and analysis during interviews

## 🧠 Emotion Detection Component

The emotion detection system is a sophisticated feature that analyzes facial expressions in real-time during interviews to provide insights into candidate confidence, engagement, and communication effectiveness.

### How It Works

1. **Real-Time Capture**: The `EmotionTracker` component accesses the user's webcam and captures video frames at configurable intervals (default: 2 seconds) during the interview session.

2. **Frame Processing**: Each captured frame is converted to a base64-encoded image and sent to a Python-based FastAPI service via a Next.js API proxy endpoint.

3. **Emotion Analysis**: The Python service uses DeepFace, a state-of-the-art facial recognition library, to analyze emotions. The system detects seven primary emotions:
   - Happy
   - Sad
   - Angry
   - Fear
   - Surprise
   - Disgust
   - Neutral

4. **Statistical Aggregation**: Throughout the interview session, the system tracks:
   - **Average emotion scores**: Mean values for each emotion category
   - **Dominant emotion counts**: Frequency of each emotion being the primary detected emotion
   - **Confidence scores**: Reliability of each detection
   - **Clarity metrics**: Difference between top emotions (indicating detection certainty)

5. **Data Storage**: Emotion data is temporarily stored in browser localStorage during the session and synced to Firebase Firestore when the interview concludes.

6. **Feedback Integration**: The aggregated emotion statistics are included in the final interview feedback, providing candidates with insights into their non-verbal communication patterns, confidence levels, and overall presentation.

### Technical Implementation

- **Frontend Component**: `EmotionTracker.tsx` - Handles webcam access, frame capture, and API communication
- **API Proxy**: `/api/emotion/analyze` - Next.js route that forwards requests to the Python service
- **Python Service**: `emotion_recognition.py` - FastAPI service using DeepFace for emotion analysis
- **Sync Component**: `EmotionFeedbackSync.tsx` - Automatically syncs emotion data to feedback documents

### Benefits

- **Objective Assessment**: Provides quantifiable metrics on candidate presentation beyond verbal responses
- **Confidence Tracking**: Identifies moments of high/low confidence throughout the interview
- **Communication Analysis**: Evaluates engagement levels and emotional consistency
- **Actionable Insights**: Helps candidates understand their non-verbal communication patterns

## 🛠️ Tech Stack

### Core Technologies
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Firebase**: Authentication and Firestore database
- **Tailwind CSS**: Utility-first CSS framework

### AI & ML
- **Google Gemini 2.0 Flash**: Question generation and feedback analysis
- **Vapi.ai**: Voice conversation platform
- **11labs**: Text-to-speech synthesis
- **DeepFace**: Facial emotion recognition
- **Deepgram**: Speech-to-text transcription

### Additional Libraries
- **React Hook Form**: Form management
- **Zod**: Schema validation
- **Day.js**: Date manipulation
- **Lucide React**: Icon library

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+ (for emotion detection service)
- Firebase project with Firestore enabled
- Vapi.ai account and API keys
- Google AI API key (for Gemini)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ai_mock_interviews
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file with:
   ```env
   NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token
   NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_key
   EMOTION_SERVICE_URL=http://localhost:8000
   # Firebase configuration
   FIREBASE_PROJECT_ID=your_project_id
   # ... other Firebase credentials
   ```

4. **Set up Python emotion service**
   ```bash
   pip install fastapi uvicorn deepface opencv-python
   python emotion_recognition.py
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
ai_mock_interviews/
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Protected pages
│   │   ├── interview/     # Interview pages
│   │   └── feedback/      # Feedback display
│   └── api/               # API routes
│       ├── emotion/       # Emotion analysis proxy
│       └── vapi/          # Interview generation
├── components/            # React components
│   ├── Agent.tsx          # Main interview agent
│   ├── EmotionTracker.tsx # Emotion detection
│   └── ...
├── lib/                   # Utility functions
│   ├── actions/           # Server actions
│   └── vapi.sdk.ts        # Vapi SDK setup
├── constants/             # Configuration constants
└── emotion_recognition.py # Python emotion service
```

## 🎓 Academic Applications

This project demonstrates:
- Integration of multiple AI services (Gemini, Vapi, DeepFace)
- Real-time webcam processing and emotion recognition
- Server-side AI processing with Next.js API routes
- Modern React patterns and state management
- Full-stack development with TypeScript
- Database design and data persistence
- User authentication and authorization
- Responsive UI/UX design

## 📝 License

This project is developed for educational and demonstration purposes.
