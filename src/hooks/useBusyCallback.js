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
    let allSuccess = keys.length > 0; // True only if ALL are successful
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

/**
 * Custom hook to easily read the state of a SPECIFIC task from anywhere in the app.
 * 
 * @param {string} taskKey - The unique key provided to the useBusyCallback hook.
 * @returns {BusyState} The current state of the task.
 */
export const useTaskState = (taskKey) => {
  return useRecoilValue(getTaskStateSelector(taskKey));
};

/**
 * Custom hook to read the state of MULTIPLE tasks at once. 
 * Provides both the individual states and aggregated boolean flags.
 * 
 * @param {string[]} keys - An array of unique task keys.
 * @returns {MultipleTasksState} The aggregated and individual states.
 * 
 * @example
 * const { states, isLoading, isError } = useTasksState(["delete-lib-1", "delete-lib-2"]);
 * // isLoading is true if EITHER task is loading.
 * // states["delete-lib-1"].data gives the specific data for task 1.
 */
export const useTasksState = (keys = []) => {
  // MAGIC FIX: Sort and join to create a stable string cache key for Recoil's selectorFamily.
  // This prevents memory leaks and cache bloat if the array reference changes on every render.
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
  
  const stableKey = useRef(key || callback?.name || `task_${Math.random().toString(36).substr(2, 9)}`).current;

  const setBusyState = useRecoilCallback(({ set }) => (nextState) => {
    set(busyStatesAtom, (prev) => ({ ...prev, [stableKey]: nextState }));
  }, [stableKey]);

  const globalStates = useRecoilValue(busyStatesAtom);
  const state = globalStates[stableKey] || defaultState;

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
    [callback, setBusyState, stableKey]
  );

  const reset = useCallback(() => {
    setBusyState(defaultState);
  }, [setBusyState]);

  return /** @type {[(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>, BusyState, () => void]} */ ([
    execute, 
    state, 
    reset
  ]);
};