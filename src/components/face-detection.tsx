"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  FaceDetector,
  FilesetResolver,
  Detection,
} from "@mediapipe/tasks-vision";
import { toast } from "sonner";

export default function FaceDetection() {
  // State to track if a subject is in the frame
  const [subjectInFrame, setSubjectInFrame] = useState(false);

  // Refs for video and live view elements
  const videoRef = useRef<HTMLVideoElement>(null);
  const liveViewRef = useRef<HTMLDivElement>(null);
  // Ref to store detection overlay elements for cleanup
  const childrenRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    // Initialize face detector and enable webcam on component mount
    const initializeFaceDetector = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
      );
      const detector = await FaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
          delegate: "GPU",
        },
        runningMode: "VIDEO",
      });
      enableCam(detector);
    };

    initializeFaceDetector();
  }, []);

  // Function to enable webcam and start face detection
  const enableCam = async (detector: FaceDetector) => {
    try {
      const constraints = { video: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.addEventListener("loadeddata", () =>
          predictWebcam(detector)
        );
      }
    } catch (err) {
      console.error("Error accessing the webcam:", err);
    }
  };

  // Variable to track the last processed video frame time
  let lastVideoTime = -1;

  // Function to perform face detection on each video frame
  const predictWebcam = async (detector: FaceDetector) => {
    if (!videoRef.current || !liveViewRef.current) return;

    const startTimeMs = performance.now();
    if (videoRef.current.currentTime !== lastVideoTime) {
      lastVideoTime = videoRef.current.currentTime;
      const detections = detector.detectForVideo(
        videoRef.current,
        startTimeMs
      ).detections;
      displayVideoDetections(detections);
      const isSubjectInFrame = detections.length > 0;
      setSubjectInFrame(isSubjectInFrame);
    }

    // Continue the detection loop
    requestAnimationFrame(() => predictWebcam(detector));
  };

  // Function to display detection results on the video
  const displayVideoDetections = (detections: Detection[]) => {
    if (!liveViewRef.current || !videoRef.current) return;

    // Remove previous detections
    childrenRef.current.forEach((child) =>
      liveViewRef.current?.removeChild(child)
    );
    childrenRef.current = [];

    detections.forEach((detection) => {
      // Create and style confidence label
      const p = document.createElement("p");
      p.innerText = `Confidence: ${Math.round(
        detection.categories[0].score * 100
      )}%`;
      p.style.cssText = `
        position: absolute;
        left: ${detection?.boundingBox?.originX ?? 0}px;
        top: ${detection?.boundingBox?.originY ?? 0 - 30}px;
        width: ${detection?.boundingBox?.width ?? 0 - 10}px;
        margin: 0;
        color: #fff;
        background: rgba(0, 0, 0, 0.5);
        padding: 5px;
      `;

      // Create and style bounding box
      const highlighter = document.createElement("div");
      highlighter.style.cssText = `
        position: absolute;
        left: ${detection?.boundingBox?.originX}px;
        top: ${detection?.boundingBox?.originY ?? 0}px;
        width: ${detection?.boundingBox?.width ?? 0 - 10}px;
        height: ${detection?.boundingBox?.height ?? 0}px;
        border: 2px solid #fff;
        z-index: 1;
      `;

      liveViewRef.current?.appendChild(highlighter);
      liveViewRef.current?.appendChild(p);
      childrenRef.current.push(highlighter);
      childrenRef.current.push(p);

      // Create and style keypoints
      detection.keypoints.forEach((keypoint) => {
        const keypointEl = document.createElement("div");
        keypointEl.style.cssText = `
          position: absolute;
          top: ${keypoint.y * videoRef.current!.offsetHeight - 3}px;
          left: ${keypoint.x * videoRef.current!.offsetWidth - 3}px;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff0000;
        `;
        liveViewRef.current?.appendChild(keypointEl);
        childrenRef.current.push(keypointEl);
      });
    });
  };

  useEffect(() => {
    if (!subjectInFrame) {
      toast.error("Subject is not in frame");
    }
  }, [subjectInFrame]);

  return (
    <div className="relative w-full h-full">
      {/* Display whether a subject is in the frame */}
      <div className="absolute top-4 left-4 z-20 bg-black bg-opacity-50 text-white p-2 rounded">
        Subject in frame: {subjectInFrame ? "Yes" : "No"}
      </div>
      {/* Container for video and detection overlays */}
      <div ref={liveViewRef} className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
      </div>
    </div>
  );
}
