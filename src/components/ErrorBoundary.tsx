import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    errorInfo: string | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            errorInfo: error.message
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return (
                <div className="p-4 bg-red-50 border border-red-500 rounded">
                    <h2 className="text-red-700 font-bold">Something went wrong</h2>
                    {this.state.errorInfo && (
                        <pre className="mt-2 text-sm text-red-600">
                            {this.state.errorInfo}
                        </pre>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;