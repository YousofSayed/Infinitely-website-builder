/**
 * 
 * @param {Worker} worker 
 * @returns 
 */
export const reInitWorker = (worker) => {
 worker.terminate();
 
}
