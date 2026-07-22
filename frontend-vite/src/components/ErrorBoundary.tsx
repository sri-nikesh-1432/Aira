import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Sun, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AIRA OS Error:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="glass max-w-lg w-full">
            <CardContent className="p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6 glow-sun">
                <Sun className="w-10 h-10 text-white" />
              </div>
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mx-auto -mt-20 mb-4">
                <AlertTriangle className="w-7 h-7 text-red-400" />
              </div>
              <h2 className="text-xl font-bold mb-2">System Malfunction</h2>
              <p className="text-gray-400 mb-6 text-sm">
                An unexpected error occurred in the AIRA OS. Our engineering team has been notified.
              </p>
              <div className="glass-light rounded-lg p-3 mb-6 text-left">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error?.message || "Unknown error"}
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={this.handleReset} className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </Button>
                <Link to="/">
                  <Button variant="outline" className="gap-2" onClick={this.handleReset}>
                    <Home className="w-4 h-4" />
                    Dashboard
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
