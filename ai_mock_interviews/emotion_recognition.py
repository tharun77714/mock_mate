"""
Emotion Recognition using DeepFace
Supports real-time webcam and image file detection
"""

import cv2
import numpy as np
from deepface import DeepFace
import os
import sys
from pathlib import Path
from collections import Counter


class EmotionRecognition:
    def __init__(self):
        self.backends = ['opencv', 'ssd', 'dlib', 'mtcnn', 'retinaface']
        self.current_backend = 'opencv'  # Fast default backend
        # Session tracking for emotion statistics
        self.session_data = {
            'angry': [],
            'disgust': [],
            'fear': [],
            'happy': [],
            'sad': [],
            'surprise': [],
            'neutral': []
        }
        self.total_detections = 0
        self.dominant_emotions = []  # Track which emotion was dominant in each detection
        self.confidence_scores = []  # Track confidence of dominant emotion in each detection
        self.detection_clarity = []  # Track how clear each detection was (difference between top 2 emotions)
        
    def detect_emotions_from_image(self, image_path, backend='opencv'):
        """
        Detect emotions from an image file
        
        Args:
            image_path: Path to the image file
            backend: Face detection backend (opencv, ssd, dlib, mtcnn, retinaface)
        
        Returns:
            Dictionary with emotion analysis results
        """
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image file not found: {image_path}")
        
        try:
            # Analyze emotions
            result = DeepFace.analyze(
                img_path=image_path,
                actions=['emotion'],
                enforce_detection=True,
                detector_backend=backend,
                silent=True
            )
            
            return result
        except Exception as e:
            print(f"Error analyzing image: {str(e)}")
            return None
    
    def detect_emotions_from_frame(self, frame, backend='opencv'):
        """
        Detect emotions from a video frame (numpy array)
        
        Args:
            frame: Video frame as numpy array
            backend: Face detection backend
        
        Returns:
            Dictionary with emotion analysis results or None
        """
        try:
            # Save frame temporarily for DeepFace
            temp_path = "temp_frame.jpg"
            cv2.imwrite(temp_path, frame)
            
            # Analyze emotions
            result = DeepFace.analyze(
                img_path=temp_path,
                actions=['emotion'],
                enforce_detection=False,
                detector_backend=backend,
                silent=True
            )
            
            # Clean up temp file
            if os.path.exists(temp_path):
                os.remove(temp_path)
            
            return result
        except Exception as e:
            # Clean up temp file on error
            if os.path.exists("temp_frame.jpg"):
                os.remove("temp_frame.jpg")
            return None
    
    def get_dominant_emotion(self, result):
        """
        Get the dominant emotion from analysis result
        
        Args:
            result: DeepFace analysis result
        
        Returns:
            Tuple of (emotion_name, confidence_percentage)
        """
        if isinstance(result, list):
            result = result[0]
        
        if 'emotion' in result:
            emotions = result['emotion']
            dominant_emotion = max(emotions.items(), key=lambda x: x[1])
            return dominant_emotion
        return None
    
    def record_emotions(self, result):
        """
        Record emotion values to session data
        
        Args:
            result: DeepFace analysis result
        """
        if result is None:
            return
        
        if isinstance(result, list):
            result = result[0]
        
        if 'emotion' in result:
            emotions = result['emotion']
            for emotion_name, confidence in emotions.items():
                if emotion_name in self.session_data:
                    self.session_data[emotion_name].append(confidence)
            
            # Track dominant emotion
            dominant = self.get_dominant_emotion(result)
            if dominant:
                emotion_name, _ = dominant
                self.dominant_emotions.append(emotion_name)
            
            # Calculate confidence using weighted emotion method
            # Positive emotions: Neutral (+0.50), Happy (+0.60)
            # Negative emotions: Fear (-0.30), Sad (-0.20), Disgust (-0.15), Angry (-0.10), Surprise (-0.05)
            
            # Get emotion values (convert percentages to 0-1 scale for calculation)
            neutral_val = emotions.get('neutral', 0) / 100.0
            happy_val = emotions.get('happy', 0) / 100.0
            fear_val = emotions.get('fear', 0) / 100.0
            sad_val = emotions.get('sad', 0) / 100.0
            disgust_val = emotions.get('disgust', 0) / 100.0
            angry_val = emotions.get('angry', 0) / 100.0
            surprise_val = emotions.get('surprise', 0) / 100.0
            
            # Calculate weighted sum
            weighted_sum = (
                (neutral_val * 0.50) +      # Positive
                (happy_val * 0.60) +        # Positive
                (fear_val * -0.30) +        # Negative (increased)
                (sad_val * -0.20) +         # Negative (increased)
                (disgust_val * -0.15) +     # Negative (increased)
                (angry_val * -0.10) +       # Negative (increased)
                (surprise_val * -0.05)      # Negative (increased)
            )
            
            # Multiply by 100 to get base confidence score
            base_confidence = weighted_sum * 100
            
            # Add base offset to shift range to 45-90
            # Base offset ensures minimum confidence of ~45
            confidence = base_confidence + 50.0
            
            # Normalize to 45-100 range (cap at 100, minimum 45)
            confidence = min(confidence, 100.0)
            confidence = max(confidence, 45.0)
            
            self.confidence_scores.append(confidence)
            
            # Calculate detection clarity (difference between top and second emotion)
            sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
            if len(sorted_emotions) >= 2:
                top_confidence = sorted_emotions[0][1]
                second_confidence = sorted_emotions[1][1]
                clarity = top_confidence - second_confidence
                self.detection_clarity.append(clarity)
            else:
                self.detection_clarity.append(0.0)
            
            self.total_detections += 1
    
    def get_average_emotions(self):
        """
        Calculate average emotion values for the session
        
        Returns:
            Dictionary with average values for each emotion
        """
        averages = {}
        for emotion_name, values in self.session_data.items():
            if len(values) > 0:
                averages[emotion_name] = sum(values) / len(values)
            else:
                averages[emotion_name] = 0.0
        return averages
    
    def get_average_confidence(self):
        """
        Calculate average confidence score using weighted emotion method
        
        Returns:
            Average confidence percentage (calculated using weighted emotion formula)
        """
        if len(self.confidence_scores) > 0:
            return sum(self.confidence_scores) / len(self.confidence_scores)
        return 0.0
    
    def get_non_neutral_emotion_strength(self):
        """
        Calculate the average strength of non-neutral emotions across all detections
        
        Returns:
            Dictionary with average values for non-neutral emotions only
        """
        non_neutral_emotions = ['angry', 'disgust', 'fear', 'happy', 'sad', 'surprise']
        averages = {}
        for emotion_name in non_neutral_emotions:
            if emotion_name in self.session_data and len(self.session_data[emotion_name]) > 0:
                averages[emotion_name] = sum(self.session_data[emotion_name]) / len(self.session_data[emotion_name])
            else:
                averages[emotion_name] = 0.0
        return averages
    
    def get_average_clarity(self):
        """
        Calculate average detection clarity
        
        Returns:
            Average clarity percentage (difference between top and second emotion)
        """
        if len(self.detection_clarity) > 0:
            return sum(self.detection_clarity) / len(self.detection_clarity)
        return 0.0
    
    def get_confidence_rating(self, avg_confidence):
        """
        Get a confidence rating based on average confidence
        
        Args:
            avg_confidence: Average confidence percentage
            
        Returns:
            Confidence rating string
        """
        if avg_confidence >= 80:
            return "Very High"
        elif avg_confidence >= 60:
            return "High"
        elif avg_confidence >= 40:
            return "Moderate"
        elif avg_confidence >= 20:
            return "Low"
        else:
            return "Very Low"
    
    def display_session_statistics(self):
        """
        Display session statistics including averages and confidence metrics
        """
        if self.total_detections == 0:
            print("\n=== Session Statistics ===")
            print("No emotion detections recorded yet.")
            return
        
        averages = self.get_average_emotions()
        sorted_averages = sorted(averages.items(), key=lambda x: x[1], reverse=True)
        avg_confidence = self.get_average_confidence()
        avg_clarity = self.get_average_clarity()
        confidence_rating = self.get_confidence_rating(avg_confidence)
        
        print("\n" + "="*50)
        print("=== Session Statistics ===")
        print(f"Total Detections: {self.total_detections}")
        print("-"*50)
        
        # Confidence Metrics Section (using weighted emotion method)
        print("Confidence Metrics (weighted emotion method):")
        print("-"*50)
        print("Weights: Neutral(+0.30), Happy(+0.50), Fear(-0.40), Sad(-0.70),")
        print("         Disgust(-0.15), Angry(-0.20), Surprise(-0.05)")
        print("Base Offset: +50 (ensures range 45-100)")
        print("-"*50)
        print(f"Average Confidence: {avg_confidence:6.2f}%")
        print(f"Confidence Rating: {confidence_rating}")
        print(f"Average Detection Clarity: {avg_clarity:6.2f}%")
        
        # Confidence bar visualization
        confidence_bar_length = int(avg_confidence / 2)
        confidence_bar = "█" * confidence_bar_length
        print(f"Confidence Level: {confidence_bar} {avg_confidence:.1f}%")
        
        print("-"*50)
        
        print("Average Emotion Values:")
        print("-"*50)
        
        for emotion, avg_value in sorted_averages:
            bar_length = int(avg_value / 2)
            bar = "█" * bar_length
            print(f"{emotion:12s}: {avg_value:6.2f}% {bar}")
        
        # Show most common dominant emotion
        if len(self.dominant_emotions) > 0:
            emotion_counts = Counter(self.dominant_emotions)
            most_common = emotion_counts.most_common(1)[0]
            print(f"\nMost Frequently Dominant Emotion: {most_common[0]} ({most_common[1]} times)")
        
        print("="*50)
    
    def reset_session(self):
        """
        Reset session data
        """
        for emotion_name in self.session_data.keys():
            self.session_data[emotion_name] = []
        self.total_detections = 0
        self.dominant_emotions = []
        self.confidence_scores = []
        self.detection_clarity = []
        print("Session data reset.")
    
    def draw_emotion_on_frame(self, frame, result, face_region=None):
        """
        Draw emotion information on frame
        
        Args:
            frame: Video frame
            result: DeepFace analysis result
            face_region: Optional face region coordinates (x, y, w, h)
        
        Returns:
            Frame with emotion annotations
        """
        if result is None:
            return frame
        
        if isinstance(result, list):
            result = result[0]
        
        # Get dominant emotion
        dominant = self.get_dominant_emotion(result)
        
        if dominant is None:
            return frame
        
        emotion_name, confidence = dominant
        
        # Get all emotions sorted by confidence
        if 'emotion' in result:
            emotions = result['emotion']
            sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)[:3]
        
        # If face region provided, draw bounding box
        if face_region:
            x, y, w, h = face_region
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            
            # Draw emotion text above face
            text = f"{emotion_name}: {confidence:.1f}%"
            cv2.putText(frame, text, (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
        else:
            # Draw on top-left corner
            y_offset = 30
            text = f"Dominant: {emotion_name} ({confidence:.1f}%)"
            cv2.putText(frame, text, (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            # Show top 3 emotions
            for i, (emotion, conf) in enumerate(sorted_emotions):
                y_offset += 25
                text = f"{emotion}: {conf:.1f}%"
                cv2.putText(frame, text, (10, y_offset), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
        
        return frame
    
    def analyze_image_file(self, image_path, display=True):
        """
        Analyze emotions from an image file and optionally display results
        
        Args:
            image_path: Path to image file
            display: Whether to display the image with annotations
        """
        print(f"\nAnalyzing image: {image_path}")
        result = self.detect_emotions_from_image(image_path)
        
        if result:
            if isinstance(result, list):
                result = result[0]
            
            # Record emotions to session
            self.record_emotions(result)
            
            print("\n=== Emotion Analysis ===")
            if 'emotion' in result:
                emotions = result['emotion']
                sorted_emotions = sorted(emotions.items(), key=lambda x: x[1], reverse=True)
                
                for emotion, confidence in sorted_emotions:
                    bar = "█" * int(confidence / 2)
                    print(f"{emotion:12s}: {confidence:6.2f}% {bar}")
            
            dominant = self.get_dominant_emotion(result)
            if dominant:
                print(f"\n>>> Dominant Emotion: {dominant[0]} ({dominant[1]:.2f}%) <<<")
            
            if display:
                # Load and display image
                image = cv2.imread(image_path)
                image = self.draw_emotion_on_frame(image, result)
                
                # Resize if too large
                height, width = image.shape[:2]
                max_height = 800
                if height > max_height:
                    scale = max_height / height
                    new_width = int(width * scale)
                    image = cv2.resize(image, (new_width, max_height))
                
                cv2.imshow("Emotion Recognition", image)
                print("\nPress any key to close the window...")
                cv2.waitKey(0)
                cv2.destroyAllWindows()
        else:
            print("Failed to detect face or analyze emotions.")
    
    def realtime_webcam(self, backend='opencv'):
        """
        Real-time emotion recognition from webcam
        
        Args:
            backend: Face detection backend
        """
        print("\nStarting webcam emotion recognition...")
        print("Press 'q' to quit")
        print("Press 's' to save current frame")
        print("Press 'r' to view session statistics")
        print("Press 'c' to reset session data")
        
        cap = cv2.VideoCapture(0)
        
        if not cap.isOpened():
            print("Error: Could not open webcam")
            return
        
        frame_count = 0
        analyze_interval = 5  # Analyze every Nth frame for performance
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Analyze every Nth frame
            result = None
            if frame_count % analyze_interval == 0:
                result = self.detect_emotions_from_frame(frame, backend)
                # Record emotions to session
                if result is not None:
                    self.record_emotions(result)
            
            # Draw previous result on current frame
            if result is not None:
                frame = self.draw_emotion_on_frame(frame, result)
            
            # Display detection count on frame
            detection_text = f"Detections: {self.total_detections}"
            cv2.putText(frame, detection_text, 
                       (10, frame.shape[0] - 60), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            
            # Add instructions
            cv2.putText(frame, "Press 'q' to quit, 's' to save, 'r' for stats, 'c' to reset", 
                       (10, frame.shape[0] - 20), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            cv2.imshow("Real-time Emotion Recognition", frame)
            
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                filename = f"captured_emotion_{frame_count}.jpg"
                cv2.imwrite(filename, frame)
                print(f"Frame saved as {filename}")
            elif key == ord('r'):
                # Display statistics in console
                self.display_session_statistics()
            elif key == ord('c'):
                self.reset_session()
        
        cap.release()
        cv2.destroyAllWindows()
        print("Webcam closed.")
        # Show final statistics
        self.display_session_statistics()


def main():
    """Main function with CLI interface"""
    recognizer = EmotionRecognition()
    
    while True:
        print("\n=== Emotion Recognition System ===")
        print("1. Analyze image file")
        print("2. Real-time webcam")
        print("3. View session statistics")
        print("4. Reset session data")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == '1':
            image_path = input("Enter image file path: ").strip().strip('"')
            if os.path.exists(image_path):
                recognizer.analyze_image_file(image_path)
                # Show updated statistics after analysis
                recognizer.display_session_statistics()
            else:
                print(f"Error: File not found: {image_path}")
        
        elif choice == '2':
            backend = input("Enter backend (opencv/ssd/dlib/mtcnn/retinaface) [default: opencv]: ").strip()
            if not backend:
                backend = 'opencv'
            recognizer.realtime_webcam(backend)
        
        elif choice == '3':
            recognizer.display_session_statistics()
        
        elif choice == '4':
            confirm = input("Are you sure you want to reset session data? (y/n): ").strip().lower()
            if confirm == 'y':
                recognizer.reset_session()
            else:
                print("Reset cancelled.")
        
        elif choice == '5':
            # Show final statistics before exiting
            recognizer.display_session_statistics()
            print("\nGoodbye!")
            sys.exit(0)
        
        else:
            print("Invalid choice!")


if __name__ == "__main__":
    main()

