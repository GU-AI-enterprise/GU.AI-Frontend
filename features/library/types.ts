export type Cat = "all" | "model" | "pose" | "prompt" | "background" | "example";

export interface Item {
  id: string;
  cat: Exclude<Cat, "all">;
  title: string;
  image?: string;
  promptText?: string;
  tags: string[];
  desc: string;
  studioHref?: string;
  imgAspect?: "portrait" | "landscape" | "square" | "tall";
}
