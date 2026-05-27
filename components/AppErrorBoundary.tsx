"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Unhandled app error", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="flex min-h-screen items-center justify-center px-4 py-10">
          <section
            role="alert"
            className="w-full max-w-md rounded-lg border bg-background p-6 text-center shadow-xs"
          >
            <h1 className="text-2xl font-semibold tracking-tight">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              The game browser hit an unexpected error. Try again to reload this
              view.
            </p>
            <Button type="button" className="mt-5" onClick={this.handleReset}>
              Try again
            </Button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}
