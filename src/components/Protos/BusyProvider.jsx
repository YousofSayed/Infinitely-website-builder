import { createContext, useContext, useState, useCallback } from "react";

/**
 * @typedef {Object} BusyContextValue
 * @property {boolean} isBusy - Indicates whether a busy operation is currently running.
 * @property {(fn: () => Promise<any>) => Promise<void>} runWithBusy
 * Wraps an async function and ensures only one operation runs at a time.
 * If an operation is already running, the call is ignored.
 */

const BusyContext = createContext(
  /** @type {BusyContextValue | null} */ (null)
);

/**
 * Provides global busy state management.
 *
 * Prevents concurrent async executions by exposing `runWithBusy`,
 * which locks execution while a task is running.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export function BusyProvider({ children }) {
  const [isBusy, setIsBusy] = useState(false);

  /**
   * Executes an async function while setting `isBusy` to true.
   * If already busy, the function will not execute.
   *
   * @param {() => Promise<any>} fn - Async function to execute.
   * @returns {Promise<void>}
   */
  const runWithBusy = useCallback(async (fn) => {
    if (isBusy) return;

    try {
      setIsBusy(true);
      await fn();
    } finally {
      setIsBusy(false);
    }
  }, [isBusy]);

  return (
    <BusyContext.Provider value={{ isBusy, runWithBusy }}>
      {children}
    </BusyContext.Provider>
  );
}

/**
 * Custom hook to access busy state and executor.
 *
 * Must be used inside a {@link BusyProvider}.
 *
 * @throws {Error} If used outside of BusyProvider.
 * @returns {BusyContextValue}
 */
export function useBusy() {
  const context = useContext(BusyContext);

  if (!context) {
    throw new Error("useBusy must be used inside BusyProvider");
  }

  return context;
}
