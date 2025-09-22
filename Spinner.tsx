
import React from 'react';

interface SpinnerProps {
    message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message = "로딩 중..." }) => {
    return (
        <div className="flex flex-col items-center justify-center my-10 p-6 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            {message && <p className="mt-4 text-gray-600 font-semibold">{message}</p>}
        </div>
    );
};