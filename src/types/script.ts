import type { TreeItem, TreeItemIndex } from 'react-complex-tree';

export interface Script {
  id: string;
  name: string;
  description: string;
  code: string;
  /**
   * Optional id of the script acting as this script's parent folder.
   * If not provided, the script is considered top-level.
   */
  parentId?: string;
}

export interface Folder {
  id: string;
  name: string;
  /** Optional parent folder */
  parentId?: string;
}

export type ItemData =
  | { type: 'script'; script: Script }
  | { type: 'folder'; folder: Folder };

export type ListItem = TreeItem<ItemData>;

export type ListItems = Record<TreeItemIndex, ListItem>;
