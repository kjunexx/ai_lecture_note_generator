
import React, { useMemo } from 'react';

interface DisplayImage {
    src: string | null;
    description: string;
}

interface NoteDisplayProps {
    notes: string;
    images: DisplayImage[];
    fontClassName: string;
}

export const NoteDisplay: React.FC<NoteDisplayProps> = ({ notes, images, fontClassName }) => {

    const parsedContent = useMemo(() => {
        if (!notes) return [];

        // Split the notes by the image placeholder [IMG:index]
        const parts = notes.split(/(\[IMG:\d+\])/g);

        return parts.map((part, index) => {
            const match = part.match(/\[IMG:(\d+)\]/);
            if (match) {
                const imageIndex = parseInt(match[1], 10);
                const imageData = images[imageIndex];
                if (imageData && imageData.src) {
                    return (
                        <figure key={`img-${index}`} className="my-6 flex flex-col items-center">
                            <img
                                src={imageData.src as string}
                                alt={imageData.description}
                                className="max-w-full md:max-w-lg rounded-lg shadow-lg border"
                            />
                            <figcaption className="mt-3 text-base text-center text-gray-600 italic">
                                {imageData.description}
                            </figcaption>
                        </figure>
                    );
                }
                return null; // Image not found, render nothing
            } else {
                 // Replace markdown-like bold syntax with HTML tags
                const formattedPart = part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Also handle the professor's emphasis format
                const finalFormattedPart = formattedPart.replace(/⚡️\s?\[교수님 강조\]:\s?(.*)/g, '<strong class="text-indigo-600">⚡️ [교수님 강조]: $1</strong>');
                return (
                    <span key={`text-${index}`} dangerouslySetInnerHTML={{ __html: finalFormattedPart.replace(/\n/g, '<br />') }} />
                );
            }
        });
    }, [notes, images]);

    return (
        <div
            id="note-display-area"
            className={`bg-white p-6 md:p-8 border border-gray-200 rounded-xl prose max-w-none transition-all duration-300 ${fontClassName} text-xl leading-relaxed tracking-wide`}
        >
            {parsedContent}
        </div>
    );
};
