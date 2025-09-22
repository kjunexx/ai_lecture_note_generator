
export interface FontOption {
    name: string;
    className: string;
}

export interface ImageInstruction {
    sourceImageIndex: number;
    description: string;
}

export interface GeminiNoteResponse {
    note: string;
    images: ImageInstruction[];
}
