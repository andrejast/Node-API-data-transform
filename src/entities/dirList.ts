import { Dir } from "../types/filesType";
import { DirNode } from "./dirNode";

export class DirList {
  private nodes: DirNode[] = [];

  // Method to find an existing top-level node or create a new one
  findOrCreateNode(name: string) {
    // Try to find and return an existing node with the given name
    let node = this.nodes.find((n) => n.name === name);
    if (node) return node;

    // If the node doesn't exist, create a new one and add it to the nodes array
    node = new DirNode(name);
    this.nodes.push(node);

    // Return the newly created node
    return node;
  }

  // Method to serialize the entire directory structure into a Dir object
  serialize(): Dir {
    // Use reduce to create a single Dir object from all top-level nodes
    return this.nodes.reduce<Dir>((acc, n) => {
      // Serialize the current node
      const t = n.serialize();
      // Add the serialized node to the accumulator, using the node's name as the key
      acc[n.name] = t[n.name];
      // Return the updated accumulator
      return acc;
    }, {});
  }
}