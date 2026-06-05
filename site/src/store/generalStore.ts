import { PageName } from "@/config";
import { atom } from "jotai";

export const isMobileAtom = atom<boolean>(false);

export const currentPageAtom = atom<PageName>("127.0.0.1");
