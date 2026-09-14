/**
 * 
 * @param {{search : string}} param0 
 * @returns {Promise<{results : import("@/helpers/types").JSLibrary[]}>}
 */
async function getCDNLibraries({search=''}) {
  const searchEndPoint = `https://api.cdnjs.com/libraries?search=${search}&fields=filename,description,version,github`;
  const response = await fetch(searchEndPoint);
  const results = await response.json();
  return results;
}

async function getGoogleFonts(params) {
    // to be continued
}


export const editorAPIs = { getCDNLibraries };
