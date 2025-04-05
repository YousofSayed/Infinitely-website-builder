import { createPortal } from "react-dom";
import { refType } from "../../helpers/jsDocs";

const Portal = ({ children, container = refType }) => {
  return createPortal(children, container || document.body );
};

export default Portal;
