import { create } from 'zustand';

interface Position {
    x: number;
    y: number;
}

interface AnimationStore {
    isAnimating: boolean;
    startPos: Position | null;
    imageUrl: string | null;
    startAnimation: (pos: Position, img: string) => void;
    endAnimation: () => void;
}

export const useAnimationStore = create<AnimationStore>((set) => ({
    isAnimating: false,
    startPos: null,
    imageUrl: null,
    startAnimation: (pos, img) => set({ isAnimating: true, startPos: pos, imageUrl: img }),
    endAnimation: () => set({ isAnimating: false, startPos: null, imageUrl: null }),
}));
