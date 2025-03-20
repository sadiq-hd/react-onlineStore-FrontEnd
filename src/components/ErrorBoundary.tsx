import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallbackComponent?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error: error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("حدث خطأ في المكون:", error, errorInfo);
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallbackComponent) {
                return this.props.fallbackComponent;
            }
            
            return (
                <div className="p-6 bg-red-50 border border-red-200 rounded-lg shadow-sm my-4">
                    <div className="flex items-center mb-3">
                        <svg className="w-6 h-6 text-red-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="text-lg font-medium text-red-800">حدث خطأ أثناء تحميل هذا المكون</h3>
                    </div>
                    <p className="text-sm text-red-700 mb-2">
                        نعتذر عن الإزعاج. يرجى إعادة تحميل الصفحة للمحاولة مرة أخرى.
                    </p>
                    {this.state.error && (
                        <div className="mt-3 text-xs bg-red-100 p-2 rounded overflow-auto max-h-24">
                            <p className="font-mono">{this.state.error.toString()}</p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;