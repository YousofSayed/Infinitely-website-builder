import { useCallback, useRef } from "react";
import { atom, selector, selectorFamily, useRecoilCallback, useRecoilValue } from "recoil";

// ==============================================================================
// TYPE DEFINITIONS & CONSTANTS
// ==============================================================================

/**
 * @typedef {Object} BusyState
 * @property {boolean} isLoading
 * @property {boolean} isError
 * @property {boolean} isSuccess
 * @property {any|null} data
 * @property {Error|null} error
 */

/**
 * @typedef {Object} BusyOptions
 * @property {boolean} [isGlobal=false] - If true, contributes to global busy state.
 * @property {boolean} [persist=true] - If true, state survives unmounts via Recoil.
 * @property {string} [key] - Unique ID for the task. Required for cross-component sharing.
 */

/**
 * @typedef {Object} MultipleTasksState
 * @property {Record<string, BusyState>} states - An object containing the individual state of each task by key.
 * @property {boolean} isLoading - True if AT LEAST ONE task is currently loading.
 * @property {boolean} isError - True if AT LEAST ONE task has an error.
 * @property {boolean} isSuccess - True if ALL tasks have completed successfully.
 * @property {boolean} anySuccess - True if AT LEAST ONE task has completed successfully.
 */

const defaultState = /** @type {BusyState} */ ({
  isLoading: false, isError: false, isSuccess: false, data: null, error: null,
});

// ==============================================================================
// HELPER: AUTO-GENERATE STABLE KEY FROM SOURCE CODE
// ==============================================================================

/**
 * MAGIC FIX: Generates a stable hash from a function's source code.
 * This allows the hook to "remember" its state across component unmounts/remounts 
 * without requiring the user to manually pass a unique `key`.
 */
const getStableAutoKey = (fn) => {
  if (!fn || typeof fn !== 'function') return null;
  try {
    const str = fn.toString();
    let h1 = 0, h2 = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      h1 = (h1 << 5) - h1 + char; h1 |= 0;
      h2 = (h2 << 7) ^ char; h2 |= 0;
    }
    // Combine function name (if any) and hashes for maximum uniqueness
    return `auto_${fn.name || 'anon'}_${(h1 >>> 0).toString(36)}_${(h2 >>> 0).toString(36)}`;
  } catch (e) {
    return null;
  }
};

// ==============================================================================
// RECOIL GLOBAL STATE (Dictionary Approach)
// ==============================================================================

/**
 * @type {import('recoil').RecoilState<Record<string, BusyState>>}
 */
const busyStatesAtom = atom({
  key: "globalBusyStatesDictionary",
  default: /** @type {Record<string, BusyState>} */ ({}),
});

/**
 * True if ANY task in the dictionary is currently loading.
 * @type {import('recoil').RecoilValueReadOnly<boolean>}
 */
export const isGlobalBusySelector = selector({
  key: "isGlobalBusySelector",
  get: ({ get }) => {
    const states = get(busyStatesAtom);
    return Object.values(states).some((s) => s.isLoading === true);
  },
});

/**
 * A selector family to get the state of a SPECIFIC task by its key.
 * @type {import('recoil').SelectorFamily<BusyState, string>}
 */
export const getTaskStateSelector = selectorFamily({
  key: "getTaskStateSelector",
  get: (taskKey) => ({ get }) => {
    const states = get(busyStatesAtom);
    return states[taskKey] || defaultState;
  },
});

/**
 * A selector family to get the aggregated and individual states of MULTIPLE tasks.
 * @type {import('recoil').SelectorFamily<MultipleTasksState, string>}
 */
export const getMultipleTaskStatesSelector = selectorFamily({
  key: "getMultipleTaskStatesSelector",
  get: (joinedKeys) => ({ get }) => {
    const allStates = get(busyStatesAtom);
    const keys = joinedKeys ? joinedKeys.split('|') : [];
    
    const states = /** @type {Record<string, BusyState>} */ ({});
    let isLoading = false;
    let isError = false;
    let allSuccess = keys.length > 0; 
    let anySuccess = false;

    for (const key of keys) {
      const state = allStates[key] || defaultState;
      states[key] = state;
      
      if (state.isLoading) isLoading = true;
      if (state.isError) isError = true;
      if (!state.isSuccess) allSuccess = false;
      if (state.isSuccess) anySuccess = true;
    }

    return {
      states,
      isLoading,
      isError,
      isSuccess: allSuccess,
      anySuccess
    };
  },
});

// ==============================================================================
// HELPER HOOKS FOR CROSS-COMPONENT SHARING
// ==============================================================================

export const useTaskState = (taskKey) => {
  return useRecoilValue(getTaskStateSelector(taskKey));
};

export const useTasksState = (keys = []) => {
  const stableKeyString = Array.isArray(keys) 
    ? [...keys].filter(Boolean).sort().join('|') 
    : '';

  return useRecoilValue(getMultipleTaskStatesSelector(stableKeyString));
};

// ==============================================================================
// MAIN HOOK
// ==============================================================================

/**
 * @template {(...args: any[]) => any} T
 * @param {T} callback
 * @param {BusyOptions} [options]
 * @returns {[(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>, BusyState, () => void]}
 */
export const useBusyCallback = (callback, options = {}) => {
  const { persist = true, key } = options;
  
  // We use useRef to store the key so it only gets generated ONCE per component mount.
  const stableKeyRef = useRef(null);
  
  if (stableKeyRef.current === null) {
    if (key) {
      // 1. Use explicit key if provided
      stableKeyRef.current = key;
    } else {
      // 2. MAGIC: Generate a stable key from the function's source code!
      // Because the source code doesn't change when the component remounts, 
      // the hash will be identical, allowing Recoil to resume the exact same state.
      stableKeyRef.current = getStableAutoKey(callback) || `task_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  const stableKey = stableKeyRef.current;

  const setBusyState = useRecoilCallback(({ set }) => (nextState) => {
    set(busyStatesAtom, (prev) => ({ ...prev, [stableKey]: nextState }));
  }, [stableKey]);

  // OPTIMIZATION: Use your selector to only subscribe to this specific task's state.
  // This prevents unnecessary re-renders and ensures the state is perfectly synced 
  // even if the component unmounts and remounts.
  const state = useRecoilValue(getTaskStateSelector(stableKey));

  const execute = useCallback(
    async (...args) => {
      if (typeof callback !== "function") {
        const error = new Error("Provided callback is not a function");
        setBusyState({ ...defaultState, isError: true, error });
        throw error;
      }

      setBusyState({ ...defaultState, isLoading: true });

      try {
        const result = await callback(...args);
        setBusyState({ ...defaultState, isSuccess: true, data: result });
        return result;
      } catch (error) {
        setBusyState({ ...defaultState, isError: true, error });
        throw error;
      }
    },
    [callback, setBusyState] 
  );

  const reset = useCallback(() => {
    setBusyState(defaultState);
  }, [setBusyState]);

  return [execute, state, reset];
};