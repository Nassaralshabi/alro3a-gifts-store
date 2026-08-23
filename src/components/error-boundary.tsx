"use client";

import React from "react";

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

/** App-wide error boundary — prevents a full white screen on runtime errors. */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, forward to a monitoring service (Sentry, etc.)
    console.error("ErrorBoundary caught:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      const isAr = typeof document !== "undefined" && document.documentElement.lang !== "en";
      return (
        <div className="min-h-screen grid place-items-center bg-[#f7f8f9] p-4">
          <div className="max-w-md w-full bg-white border border-[#e4e7e9] rounded-3xl p-8 text-center shadow-lg">
            <div className="mx-auto grid place-items-center w-16 h-16 rounded-full bg-gradient-to-br from-[#8d98a0] to-[#6e7981] text-white shadow-lg">⚠</div>
            <h1 className="mt-5 text-xl">
              {isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred"}
            </h1>
            <p className="text-[13px] text-[#6c767d] mt-2 leading-relaxed">
              {isAr
                ? "نعتذر عن الإزعاج. يمكنك إعادة تحميل الصفحة والمتابعة."
                : "Sorry for the inconvenience. You can reload the page and continue."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-solid mt-6 w-full"
            >
              {isAr ? "إعادة التحميل" : "Reload page"}
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
