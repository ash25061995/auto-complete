import { useEffect, useState } from "react"

export const useDebounce = (text: string, delay: number): string => {

    const [debouncedValue, setDebouncedValue] = useState<string>(text);

    useEffect(() => {
        const timeoutId: NodeJS.Timeout = setTimeout(() => {
            setDebouncedValue(text);
        }, delay)

        return () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        }
    }, [text, delay])

    return debouncedValue;
}