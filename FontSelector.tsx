
import React from 'react';
import type { FontOption } from '../types';

interface FontSelectorProps {
    options: FontOption[];
    selected: FontOption;
    onSelect: (option: FontOption) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ options, selected, onSelect }) => {
    return (
        <div>
            <label htmlFor="font-select" className="block text-sm font-medium text-gray-700">
                글꼴 선택
            </label>
            <select
                id="font-select"
                value={selected.name}
                onChange={(e) => {
                    const selectedOption = options.find(opt => opt.name === e.target.value);
                    if (selectedOption) {
                        onSelect(selectedOption);
                    }
                }}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
                {options.map(option => (
                    <option key={option.name} value={option.name}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    );
};