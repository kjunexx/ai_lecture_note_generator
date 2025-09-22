import type { FontOption } from './types';

// The fonts are imported from Google Fonts in index.html and defined in tailwind.config
export const FONT_OPTIONS: FontOption[] = [
    { name: '개구체 (귀여운 글씨체)', className: 'font-gaegu' },
    { name: '나눔 펜 스크립트 (흘림체)', className: 'font-nanum-pen' },
    { name: '어비 세현체 (손글씨체)', className: 'font-uhbee-sehyun' },
    { name: '나만의 손글씨체 (직접 추가)', className: 'font-my-handwriting' },
];