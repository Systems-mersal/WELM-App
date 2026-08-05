import React from "react";
import { SvgXml } from "react-native-svg";

export interface LocalSvgProps {
  xml: string;
  width: number;
  height: number;
}

export function LocalSvg({ xml, width, height }: LocalSvgProps) {
  return <SvgXml xml={xml} width={width} height={height} />;
}
