import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/Alert.jsx';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null
        };
    }

    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error: error
        };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught in boundary:', {
            error,
            componentStack: errorInfo?.componentStack || 'No stack trace available'
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto mt-8">
                    <Alert variant="destructive">
                        <AlertTitle>
                            An Error Occurred
                        </AlertTitle>
                        <AlertDescription>
                            <span className="block text-sm">
                                {this.state.error?.message || 'An unexpected error occurred in the application.'}
                            </span>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                            >
                                Reload Application
                            </button>
                        </AlertDescription>
                    </Alert>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;