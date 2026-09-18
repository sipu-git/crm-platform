import { useEffect, useState } from "react";

export function useDebounceHook<T>(value: T, delay = 400) {
    const [debounce, setDebouce] = useState(value)

    useEffect(() => {
        const handle = setTimeout(() => setDebouce(value), delay)
        return () => clearTimeout(handle)
    }, [value, delay])
    return debounce;
}