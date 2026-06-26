import { Loader2 } from "lucide-react";

export function Loading({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center p-8 ${className}`}>
      <Loader2 className="size-7 animate-spin text-dz-primary-500" />
    </div>
  );
}
