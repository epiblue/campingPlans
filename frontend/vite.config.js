import { defineConfig } from 'vite';

export default defineConfig({
    test: {
        globals: true, // Enables global APIs like describe, it, expect                                                                                                
        environment: 'jsdom', // Provides a browser-like environment                                                                                                   
    },
});   