import { refType } from "@/helpers/jsDocs";
import { createPortal } from "react-dom";

const Portal = ({ children, container = refType }) => {
  
  return createPortal(children, container || document.body );
};

export default Portal;
