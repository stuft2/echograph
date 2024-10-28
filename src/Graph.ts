/**
 * States when walking the directed graph
 */
const VisitState = {
	UNVISITED: 'unvisited',
	VISITING: 'visiting',
	VISITED: 'visited',
} as const

type AnyVisitState = ValueOf<typeof VisitState>

/**
 * A simple, directed graph implementation. Nodes are the keys in the graph; edges, their children.
 * @example Add a node
 * ```javascript
 * graph.set('A')
 * ```
 * @example Add an edge
 * ```javascript
 * graph.get('A')?.add('B')
 * graph.set('B')
 * ```
 * @example Sort graph
 * ```javascript
 * const sorted = graph.sort()
 * ```
 */
export class Graph<T = string> extends Map<T, Set<T>> {
	/**
	 * Sort using Depth First Search algorithm
	 * @param throwOnCycle=false - optionally throw an error if a circular dependency is found
	 */
	sort(throwOnCycle = true): T[] {
		const sorted: T[] = [] // Stores the topologically sorted order
		const visited = new Map<T, AnyVisitState>() // Track node states

		// Initialize all nodes as 'unvisited'
		for (const node of this.keys()) {
			visited.set(node, VisitState.UNVISITED)
		}

		const dfs = (node: T) => {
			const state = visited.get(node)

			if (state === VisitState.VISITING) {
				// Found a cycle
				if (throwOnCycle) {
					throw new ErrorCyclicalDependencyFound(
						`Circular dependency detected at node: ${node}`,
					)
				} else {
					return // Optionally handle cycle silently
				}
			}

			if (state === VisitState.VISITED) {
				return // Skip already processed nodes
			}

			// Mark the node as being visited
			visited.set(node, VisitState.VISITING)

			// Recursively visit all neighbors
			for (const neighbor of this.get(node) || []) {
				dfs(neighbor)
			}

			// Mark the node as fully visited
			visited.set(node, VisitState.VISITED)

			// Push node to the sorted array after visiting all its neighbors
			sorted.push(node)
		}

		// Perform DFS from each unvisited node
		for (const node of this.keys()) {
			if (visited.get(node) === VisitState.UNVISITED) {
				dfs(node)
			}
		}

		return sorted.reverse() // Reverse the order to get the topological sort
	}
}

export class ErrorCyclicalDependencyFound extends Error {
	constructor(message: string) {
		super(message)

		// Restore prototype chain, which is necessary for custom error classes in TypeScript
		Object.setPrototypeOf(this, new.target.prototype)

		// Maintains proper stack trace for where the error was thrown (only works in V8/Node.js)
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor)
		}
	}
}

/**
 * Utility type for creating a union of all the values in an object
 */
type ValueOf<T> = T[keyof T]
