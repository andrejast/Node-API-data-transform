import { Dir } from "../types/filesType";

export class DirNode {
  private nodes: DirNode[] = [];
  private files: string[] = [];
  private _name: string;

  public get name(): string {
    return this._name;
  }

  constructor(name: string) {
    this._name = name;
  }

  // Method to find an existing child node or create a new one if it doesn't exist
  findOrCreateNode(name: string) {
    // Try to find and return existing node with the given name
    let node = this.nodes.find((n) => n.name === name);
    if (node) return node;

    // If the node doesn't exist, create a new one and add it to the nodes array
    node = new DirNode(name);
    this.nodes.push(node);

    return node;
  }

  // Method to add a file to the current directory
  addFile(name: string) {
    this.files.push(name);
  }

  // Method to serialize the directory structure into a Dir object
  serialize(): Dir {
    return {
      // Use the directory name as the key, and combine serialized child nodes and files as the value
      [this.name]: [...this.nodes.map((n) => n.serialize()), ...this.files],
    };
  }
}
