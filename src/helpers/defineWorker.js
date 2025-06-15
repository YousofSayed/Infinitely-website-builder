
/**
 * 
 * @param {string} url 
 * @param {WorkerType} type 
 * @returns 
 */

/**
 * 
 * @param {{url:string , origin : string , type:WorkerType}} param0 
 * @returns 
 */
export const defineWorker = ({url = ''  , type}) => {
  return new Worker(
  new URL(url,import.meta.url),
  {
    type,
  }
)
}
