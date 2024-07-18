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

  findOrCreateNode(name: string) {
    let node = this.nodes.find((n) => n.name === name);

    if (node) return node;

    node = new DirNode(name);
    this.nodes.push(node);

    return node;
  }

  addFile(name: string) {
    this.files.push(name);
  }

  serialize(): Dir {
    return {
      [this.name]: [...this.nodes.map((n) => n.serialize()), ...this.files],
    };
  }
}
