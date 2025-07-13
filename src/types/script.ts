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
