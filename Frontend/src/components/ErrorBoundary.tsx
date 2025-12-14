import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
                        <div className="flex items-center gap-3 mb-4 text-red-600">
                            <div className="bg-red-50 p-3 rounded-xl">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <h1 className="text-xl font-bold">Something went wrong</h1>
                        </div>
                        <p className="text-slate-600 mb-6">
                            The application encountered an unexpected error.
                        </p>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-xl text-xs font-mono overflow-auto max-h-64 mb-6">
                            <p className="text-red-400 font-bold mb-2">{this.state.error?.toString()}</p>
                            <pre>{this.state.errorInfo?.componentStack}</pre>
                        </div>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors"
                        >
                            Reload Dashboard
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
