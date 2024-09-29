"use client";

import React, { useRef, useEffect, useState } from "react";

interface Props {
  onMalpractice: boolean; // Flag that determines when malpractice occurs
}

const MalpracticeAudio = ({ onMalpractice }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isPlayingRef = useRef(false);
  const [malpracticeTimestamps, setMalpracticeTimestamps] = useState<number[]>(
    []
  );

  // Play audio for 3 seconds when malpractice occurs
  const handleMalpractice = () => {
    if (onMalpractice && audioRef.current && !isPlayingRef.current) {
      isPlayingRef.current = true;
      const currentTimestamp = Date.now();
      setMalpracticeTimestamps((prevTimestamps) => [
        ...prevTimestamps,
        currentTimestamp,
      ]);

      audioRef.current
        .play()
        .catch((error) => {
          console.log("Audio play was prevented:", error);
        })
        .finally(() => {
          isPlayingRef.current = false;
        });

      console.log("Malpractice timestamps:", [
        ...malpracticeTimestamps,
        currentTimestamp,
      ]);
    }
  };

  // Call handleMalpractice when the prop changes
  useEffect(() => {
    handleMalpractice();
  }, [onMalpractice]);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handleEnded = () => {
        isPlayingRef.current = false;
      };
      audioElement.addEventListener("ended", handleEnded);
      return () => {
        audioElement.removeEventListener("ended", handleEnded);
      };
    }
  }, []);

  return (
    <>
      <audio ref={audioRef}>
        <source
          src="/sounds/ElevenLabs_2024-09-26T19_15_20_Brian_pre_s50_sb75_se0_b_m2.mp3"
          type="audio/mpeg"
        />
        Your browser does not support the audio element.
      </audio>
      <div>
        <h3>Malpractice Timestamps:</h3>
        <ul>
          {malpracticeTimestamps.map((timestamp, index) => (
            <li key={index}>{new Date(timestamp).toLocaleString()}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default MalpracticeAudio;
