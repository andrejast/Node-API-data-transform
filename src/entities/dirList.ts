import { Dir } from "../types/filesType";
import { DirNode } from "./dirNode";

export class DirList {
  private nodes: DirNode[] = [];

  findOrCreateNode(name: string) {
    let node = this.nodes.find((n) => n.name === name);

    if (node) return node;

    node = new DirNode(name);
    this.nodes.push(node);

    return node;
  }

  serialize(): Dir {
    return this.nodes.reduce<Dir>((acc, n) => {
      const t = n.serialize();
      acc[n.name] = t[n.name];
      return acc;
    }, {});
  }
}
