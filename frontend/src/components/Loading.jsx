import { Compass } from "lucide-react";

export default function Loading({ label = "Loading…", fullscreen = false }) {
  const content = (
    <div className="flex flex-col items-center gap-3 py-12 text-muted">
      <Compass className="animate-spin text-teal" size={28} strokeWidth={1.75} />
      <p className="text-sm">{label}</p>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">{content}</div>
    );
  }
  return content;
}
