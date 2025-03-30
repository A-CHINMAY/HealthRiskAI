
import React from 'react';

const Alert = ({ variant = 'info', children }) => {
    const variantClasses = {
        info: 'bg-blue-100 text-blue-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        destructive: 'bg-red-100 text-red-800',
    };

    return (
        <div className={`p-4 rounded-md ${variantClasses[variant]}`}>
            {children}
        </div>
    );
};

const AlertTitle = ({ children }) => (
    <h4 className="font-bold">{children}</h4>
);

const AlertDescription = ({ children }) => (
    <p>{children}</p>
);

export { Alert, AlertTitle, AlertDescription };
