export interface TreeEntry {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
}

export interface TreeNode extends TreeEntry {
  children?: TreeNode[];
  loaded?: boolean;
  expanded?: boolean;
}

export interface OpenTab {
  path: string;
  name: string;
  content: string;
  originalContent: string;
  language: string;
  modified: boolean;
}

export interface ContextMenuState {
  x: number;
  y: number;
  node: TreeNode | null;
  parentPath: string;
}

export interface InlineInputState {
  type: 'new-file' | 'new-folder' | 'rename';
  parentPath: string;
  depth: number;
  originalPath?: string;
  originalName?: string;
}
