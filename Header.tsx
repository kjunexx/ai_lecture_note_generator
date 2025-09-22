
import React from 'react';

export const Header: React.FC = () => {
    return (
        <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                AI 강의 노트 생성기
            </h1>
            <p className="mt-2 text-lg text-gray-600">
                강의 자료와 음성 녹음을 아름다운 손글씨 노트로 변환하세요.
            </p>
        </header>
    );
};