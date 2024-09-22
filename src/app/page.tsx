import FaceDetection from "@/components/face-detection";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-3xl aspect-video">
        <FaceDetection />
      </div>
    </main>
  );
}
