import { MessageButtonStyleResolvable } from "discord.js";

export type SaveButton = {
  type: "save";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type PreviousPageButton = {
  type: "previousPage";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type NextPageButton = {
  type: "nextPage";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type SetButton = {
  type: "set";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type ApproveButton = {
  type: "approve";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type DisapproveButton = {
  type: "disapprove";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type CancelButton = {
  type: "cancel";
  id?: string;
  buttonId: string;
  label?: string;
  style?: MessageButtonStyleResolvable;
};

export type Button =
  | SaveButton
  | PreviousPageButton
  | NextPageButton
  | SetButton
  | ApproveButton
  | DisapproveButton
  | CancelButton;
