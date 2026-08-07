import { Block } from "@/blocks/Block";
import { Button } from "@/blocks/Button";
import { Container } from "@/blocks/Container";
import { DropArea } from "@/blocks/DropArea";
import { DynamicContainer } from "@/blocks/DynamicContainer";
import { DynamicText } from "@/blocks/DynamicText";
import { FilterButton } from "@/blocks/FilterButton";
import { Heading } from "@/blocks/Heading";
import { Image } from "@/blocks/Image";
import { Input } from "@/blocks/Input";
import { InputFilter } from "@/blocks/InputFilter";
import { Link } from "@/blocks/Link";
import { LoadMore } from "@/blocks/LoadMore";
import { Looper } from "@/blocks/Looper";
import { Media } from "@/blocks/Media";
import { NextAndPrevious } from "@/blocks/NextAndPrevious";
import { Section } from "@/blocks/Section";
import { Slider } from "@/blocks/Slider";
import { SplineScene } from "@/blocks/SplineScene";
import { Splitter } from "@/blocks/Splitter";
import { Svg } from "@/blocks/Svg";
import { Symbol } from "@/blocks/Symbol";
import { Text } from "@/blocks/Text";
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
