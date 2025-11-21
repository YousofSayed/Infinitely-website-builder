import React from "react";
import { Input } from "../Blocks/Input";
import { DynamicContainer } from "../Blocks/DynamicContainer";
import { DynamicText } from "../Blocks/DynamicText";
import { Image } from "../Blocks/Image";
import { Section } from "../Blocks/Section";
import { Container } from "../Blocks/Container";
import { Block } from "../Blocks/Block";
import { Splitter } from "../Blocks/Splitter";
import { Looper } from "../Blocks/Looper";
import { Link } from "../Blocks/Link";
import { Heading } from "../Blocks/Heading";
import { Button } from "../Blocks/Button";
import { Text } from "../Blocks/Text";
import { Media } from "../Blocks/Media";
import { Svg } from "../Blocks/Svg";
import { SplineScene } from "../Blocks/SplineScene";
import { DropArea } from "../Blocks/DropArea";
import { Slider } from "../Blocks/Slider";
import { Symbol } from "../Blocks/Symbol";
import { LoadMore } from "../Blocks/LoadMore";
import { NextAndPrevious } from "../Blocks/NextAndPrevious";
import { FilterButton } from "../Blocks/FilterButton";
import { InputFilter } from "../Blocks/InputFilter";

/**
 *
 * @param {import('grapesjs').Editor} editor
 */
export const customCmps = (editor) => {
  Symbol(editor);
  Input({ editor });
  DynamicContainer({ editor });
  DynamicText({ editor });
  Image({ editor });
  // Template({ editor });
  Container({ editor });
  Section({ editor });
  Block({ editor });
  Splitter({ editor });
  Looper({ editor });
  Link({ editor });
  Heading({ editor });
  Button({ editor });
  Text({ editor });
  Slider({ editor });
  // Video({ editor });
  // Audio({ editor });
  // Iframe({ editor });
  Media({ editor });
  SplineScene({ editor });
  DropArea({ editor });
  Svg(editor);
  LoadMore({ editor });
  NextAndPrevious({ editor });
  FilterButton({ editor });
  InputFilter({ editor });
};
