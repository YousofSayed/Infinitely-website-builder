
/**
 *
 * @param {{current : MutationRecord[]}} childListStack
 * @param {{current : number}} childListIndex
 */
export const childListObserver = (childListStack, childListIndex) => {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
    //     const realAddedNodes = Array.from(mutation.addedNodes).filter(
    //       (addedNode) => addedNode.tagName
    //     );
    //     for (let i = 0; i < realAddedNodes.length; i++) {
    //       if (realAddedNodes[i].hasAttribute("hide-in-observer")) {
    //         return;
    //       }
    //     }

    //     if (mutation.type == "childList") {
    //         console.log("lldsdao");
            
    //     childListStack.current = childListStack.current.slice(
    //       0,
    //       childListIndex.current + 1
    //     );
    //   childListStack.current.push(mutation);
    //       childListStack.current =
    //         childListStack.current.length > 100
    //           ? childListStack.current.slice(1)
    //           : childListStack.current;
    //       childListIndex.current = childListStack.current.length - 1;
    //       console.log(childListStack.current , childListIndex.current);
    //     }
      //   else if (mutation.type == "attributes") {
      //     attributesStack.current.push(mutation);
      //     attributesStack.current =
      //       attributesStack.current.length > 50
      //         ? attributesStack.current.slice(1)
      //         : attributesStack.current;
      //   } else if (mutation.type == "characterData") {
      //     characterDataStack.current.push(mutation);
      //     characterDataStack.current =
      //       characterDataStack.current.length > 50
      //         ? characterDataStack.current.slice(1)
      //         : characterDataStack.current;
      //   }
    });
  });

  return observer;
};
