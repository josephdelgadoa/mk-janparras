/// <reference types="vite/client" />
export { };

declare global {
    interface Window {
        aistudio?: {
            openSelectKey: () => Promise<string | null>;
            // Add other aistudio methods if known, otherwise this is the minimal requirement
        };
    }
}
