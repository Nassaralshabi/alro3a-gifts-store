import { cn } from "@/lib/utils";
import { isStaleDynamicImportError, reserveStaleChunkRetry } from "@/lib/dynamicImportRecovery";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    if (typeof window === "undefined" || !isStaleDynamicImportError(error)) return;
    try {
      if (reserveStaleChunkRetry(window.sessionStorage)) window.location.reload();
    } catch {
      // The manual reload control remains available when storage is unavailable.
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-background">
          <div className="flex flex-col items-center w-full max-w-2xl p-8">
            <AlertTriangle
              size={48}
              className="text-destructive mb-6 flex-shrink-0"
            />

            <h2 className="text-xl mb-2">تعذر تحميل الصفحة</h2>
            <p className="mb-6 text-center text-sm text-muted-foreground">قد يكون الموقع قد تلقّى تحديثًا جديدًا. جرّب تحديث الصفحة مرة واحدة.</p>

            {import.meta.env.DEV ? <div className="p-4 w-full rounded bg-muted overflow-auto mb-6"><pre className="text-sm text-muted-foreground whitespace-break-spaces">{this.state.error?.stack}</pre></div> : null}

            <button
              onClick={() => window.location.reload()}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg",
                "bg-primary text-primary-foreground",
                "hover:opacity-90 cursor-pointer"
              )}
            >
              <RotateCcw size={16} />
              إعادة تحميل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
