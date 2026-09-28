import { Block } from "@/Blocks/Block";
import { Button } from "@/Blocks/Button";
import { Container } from "@/Blocks/Container";
import { DropArea } from "@/Blocks/DropArea";
import { DynamicContainer } from "@/Blocks/DynamicContainer";
import { DynamicText } from "@/Blocks/DynamicText";
import { FilterButton } from "@/Blocks/FilterButton";
import { Heading } from "@/Blocks/Heading";
import { Image } from "@/Blocks/Image";
import { Input } from "@/Blocks/Input";
import { InputFilter } from "@/Blocks/InputFilter";
import { Link } from "@/Blocks/Link";
import { LoadMore } from "@/Blocks/LoadMore";
import { Looper } from "@/Blocks/Looper";
import { Media } from "@/Blocks/Media";
import { NextAndPrevious } from "@/Blocks/NextAndPrevious";
import { Section } from "@/Blocks/Section";
import { Slider } from "@/Blocks/Slider";
import { SplineScene } from "@/Blocks/SplineScene";
import { Splitter } from "@/Blocks/Splitter";
import { Svg } from "@/Blocks/Svg";
import { Symbol } from "@/Blocks/Symbol";
import { Text } from "@/Blocks/Text";
import React from "react";

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
