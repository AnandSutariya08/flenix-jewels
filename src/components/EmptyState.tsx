import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ title, description, icon, action, className }: EmptyStateProps) {
  return (
    <div className={cn("py-24 px-6", className)}>
      <div className="max-w-2xl mx-auto text-center rounded-3xl border bg-card/60 backdrop-blur-sm p-10">
        {icon ? (
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center bg-muted/60">
            <div className="opacity-80 text-primary">{icon}</div>
          </div>
        ) : null}
        <h3 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h3>
        {description ? <p className="mt-3 text-muted-foreground leading-relaxed">{description}</p> : null}
        {action ? <div className="mt-7 flex justify-center">{action}</div> : null}
      </div>
    </div>
  );
}

