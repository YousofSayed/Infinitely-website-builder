import { useCallback, useRef } from "react";
import { atom, selector, useRecoilCallback, useRecoilValue } from "recoil";

// ==============================================================================
// TYPE DEFINITIONS
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
 * @property {string} [key] - Unique ID for the task. Auto-generated if missing.
 */

// ==============================================================================
// RECOIL GLOBAL STATE (Dictionary Approach - No Counters!)
// ==============================================================================

/**
 * A global dictionary storing the BusyState for ALL tasks.
 * We use a dictionary instead of a counter so unmounted components can safely 
 * update their state without breaking a global count.
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

// ==============================================================================
// HOOK
// ==============================================================================

const defaultState = /** @type {BusyState} */ ({
  isLoading: false, isError: false, isSuccess: false, data: null, error: null,
});

/**
 * @template {(...args: any[]) => any} T
 * @param {T} callback
 * @param {BusyOptions} [options]
 * @returns {[(...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>, BusyState, () => void]}
 */
export const useBusyCallback = (callback, options = {}) => {
  const { persist = true, key } = options;
  
  // Generate a stable key. If user provides one, use it. Otherwise use function name or random ID.
  const stableKey = useRef(key || callback?.name || `task_${Math.random().toString(36).substr(2, 9)}`).current;

  // useRecoilCallback GUARANTEES this function will update Recoil even if the component is unmounted!
  const setBusyState = useRecoilCallback(({ set }) => (nextState) => {
    set(busyStatesAtom, (prev) => ({ ...prev, [stableKey]: nextState }));
  }, [stableKey]);

  // Read the state from the global dictionary
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
        // console.log(`[useBusyCallback] Starting task: ${stableKey}`);
        const result = await callback(...args);
        // console.log(`[useBusyCallback] Finished task: ${stableKey}`);
        
        setBusyState({ ...defaultState, isSuccess: true, data: result });
        return result;
      } catch (error) {
        // console.error(`[useBusyCallback] Error in task: ${stableKey}`, error);
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