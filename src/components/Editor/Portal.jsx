import { createPortal } from "react-dom";
import { refType } from "../../helpers/jsDocs";

const Portal = ({ children, container = refType }) => {
  console.log('from portal : ' , container);
  
  return createPortal(children, container || document.body );
};

export default Portal;
