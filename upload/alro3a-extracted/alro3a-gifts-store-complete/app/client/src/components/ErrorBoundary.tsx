import { cn } from "@/lib/utils";
import { isStaleDynamicImportError, reserveStaleChunkRetry } from "@/lib/dynamicImportRecovery";
import { ArrowLeft, Home, RotateCcw, Sparkles } from "lucide-react";
import React, { Component, ReactNode } from "react";

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
        <div className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f8f6f0] px-5 py-10 text-[#17323b]">
          <div aria-hidden="true" className="absolute -right-28 -top-28 h-72 w-72 rounded-full bg-[#dceff1]" />
          <div aria-hidden="true" className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#fff0cf]" />
          <div className="relative w-full max-w-xl overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-7 text-center shadow-[0_24px_70px_-34px_rgba(18,61,70,.42)] backdrop-blur sm:p-10">
            <div className="relative mx-auto mb-7 grid h-40 w-48 place-items-center" aria-hidden="true">
              <div className="absolute inset-3 rounded-[2rem] border-2 border-dashed border-[#9ed1d7]" />
              <div className="absolute inset-x-8 bottom-5 h-6 rounded-full bg-[#d8ecee]" />
              <div className="relative grid h-20 w-20 place-items-center rounded-[1.65rem] border border-[#c7e5e8] bg-[#eaf7f8] shadow-sm">
                <div className="absolute -right-2 -top-2 grid h-8 w-8 place-items-center rounded-full bg-[#f4be68] text-white shadow-sm"><Sparkles className="h-4 w-4" /></div>
                <div className="h-7 w-11 rounded-full border-2 border-[#16717d]" />
                <div className="absolute bottom-6 h-2.5 w-2.5 rounded-full bg-[#16717d]" />
              </div>
              <span className="absolute bottom-8 right-7 h-3 w-3 rounded-full bg-[#e69d5f]" />
              <span className="absolute left-8 top-7 h-2.5 w-2.5 rounded-full bg-[#16717d]" />
            </div>
            <p className="text-xs font-black tracking-[.18em] text-[#16717d]">مطبعة الروعة</p>
            <h2 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">تعذر فتح هذه الصفحة</h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#617a80]">قد يكون الموقع قد تلقّى تحديثًا جديدًا أو انقطع الاتصال للحظة. يمكنك إعادة المحاولة أو العودة للتسوّق.</p>

            {import.meta.env.DEV ? <div className="mt-6 w-full overflow-auto rounded-xl bg-[#f8f6f0] p-4 text-start"><pre className="text-xs text-[#617a80] whitespace-break-spaces">{this.state.error?.stack}</pre></div> : null}

            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <button onClick={() => window.location.reload()} className={cn("flex h-12 items-center justify-center gap-2 rounded-xl bg-[#16717d] font-bold text-white transition hover:bg-[#105d67] active:scale-[.98]")}>
                <RotateCcw className="h-4 w-4" />
                إعادة تحميل الصفحة
              </button>
              <a href="/" className="flex h-12 items-center justify-center gap-2 rounded-xl border border-[#b8d8dc] bg-white font-bold text-[#16717d] transition hover:bg-[#eef9fa] active:scale-[.98]">
                <Home className="h-4 w-4" />
                العودة إلى الصفحة الرئيسية
                <ArrowLeft className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
