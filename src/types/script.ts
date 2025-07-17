export interface BaseItem {
  id: string;
  name: string;
  parentId: string | null;
}

export interface Script extends BaseItem {
  type: 'script';
  description: string;
  code: string;
}

export interface Folder extends BaseItem {
  type: 'folder';
}

export type ListItem = Script | Folder;
