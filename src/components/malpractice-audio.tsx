"use client";

import React, { useRef, useEffect } from "react";

interface Props {
  onMalpractice: boolean; // Flag that determines when malpractice occurs
}

const MalpracticeAudio = ({ onMalpractice }: Props) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Play audio for 3 seconds when malpractice occurs
  const handleMalpractice = () => {
    if (onMalpractice && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          // Set a timeout to stop the audio after 3 seconds
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }
          }, 10000);
        })
        .catch((error) => {
          console.log("Audio play was prevented:", error);
        });
    }
  };

  // Call handleMalpractice when the prop changes
  useEffect(() => {
    handleMalpractice();
  }, [onMalpractice]);

  return (
    <audio ref={audioRef}>
      <source
        src="/sounds/ElevenLabs_2024-09-26T19_15_20_Brian_pre_s50_sb75_se0_b_m2.mp3"
        type="audio/mpeg"
      />
      Your browser does not support the audio element.
    </audio>
  );
};

export default MalpracticeAudio;
