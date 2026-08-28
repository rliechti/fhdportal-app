import { ref, watch } from 'vue'

function readStoredFlag(key, defaultValue) {
    try {
        const raw = localStorage.getItem(key)
        return raw === null ? defaultValue : JSON.parse(raw)
    } catch (e) {
        return defaultValue
    }
}

/**
 * Persists a boolean UI preference to localStorage under `key`, seeded with
 * `defaultValue` only until the user toggles it for the first time - after
 * that the stored value always wins over `defaultValue` on later visits.
 */
export function useLocalStorageFlag(key, defaultValue) {
    const value = ref(readStoredFlag(key, defaultValue))

    watch(value, (v) => {
        localStorage.setItem(key, JSON.stringify(v))
    })

    return value
}
