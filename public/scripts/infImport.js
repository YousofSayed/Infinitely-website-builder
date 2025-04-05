console.log("inf load first");

/**
 *
 * @param {InfinitelyURLsType} url
 * @example infinitelyImport(assets/filename.any)
 * @returns {string}
 */
function infinitelyImport(url) {
  try {
    const parseInfinitelyURLForWindow =
      window.parent.parseInfinitelyURLForWindow;
    const assets = window.parent.infinitelyAssets;
    console.log("assets from inside :", assets);

    return parseInfinitelyURLForWindow(url, assets).blobUrl;
  } catch (error) {
    throw new Error(error.message);
  }
}


  
  
  
