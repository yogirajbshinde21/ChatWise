// create helps you build your custom hook like useAuthStore() which you can use anywhere in your app to get or update global state.

//  -> Why use Zustand with create?
//        - Keeps your global state in one place
//        - Easy to use in any component
//        - Very lightweight and fast


import { create } from "zustand";

export const useThemeStore = create((set) => ({
    theme: localStorage.getItem("chat-theme") || "coffee",   // Using localStorage to get the theme, and if it is null then use the default theme "coffee".
    setTheme: (theme) => {
        localStorage.setItem("chat-theme", theme);
        set({ theme });
    },
}));