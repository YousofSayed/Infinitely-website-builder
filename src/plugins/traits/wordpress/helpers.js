/**
 *
 * @param {{editor : import('grapesjs').Editor , model : import('grapesjs').Component , values : string[] , excludes : string[]}} param0
 * @returns
 */
export const showCallback = ({ editor, model, values = [], excludes = ['show-dots'] }) => {
  return () =>
    !values
      .filter((v) => !excludes.includes(model.getTrait?.(v)?.attributes?.name))
      .map((v) => model.getTrait?.(v)?.attributes?.value)
      ?.some?.(Boolean);
};
