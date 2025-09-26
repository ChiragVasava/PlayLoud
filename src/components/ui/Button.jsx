// components/ui/Button.jsx
import React from 'react';

const Button = ({
    children,
    variant = 'primary',
    size = 'medium',
    disabled = false,
    loading = false,
    onClick,
    className = '',
    ...props
}) => {
    const variants = {
        primary: 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-white',
        ghost: 'bg-transparent hover:bg-gray-700 text-black hover:text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white'
    };

    const sizes = {
        small: 'px-3 py-1.5 text-sm',
        medium: 'px-4 py-2 text-sm',
        large: 'px-6 py-3 text-base'
    };

    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed';

    return (
        <button
            className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${!disabled && !loading ? 'transform hover:scale-105' : ''
                }`}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading ? (
                <div className="flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                    {children}
                </div>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;