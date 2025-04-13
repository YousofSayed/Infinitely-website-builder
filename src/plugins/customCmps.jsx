import React from "react";
import { Input } from "../Blocks/Input";
import { DynamicContainer } from "../Blocks/DynamicContainer";
import { DynamicText } from "../Blocks/DynamicText";
import { Image } from "../Blocks/Image";
import { Template } from "../Blocks/Template";
import { Section } from "../Blocks/Section";
import { Container } from "../Blocks/Container";
import { Block } from "../Blocks/Block";
import { Video } from "../Blocks/Video";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const customCmps = (editor) => {
  Input({ editor });
  DynamicContainer({ editor });
  DynamicText({ editor });
  Image({ editor });
  Video({editor})
  // Template({ editor });
  Container({ editor });
  Section({ editor });
  Block({ editor });
};
