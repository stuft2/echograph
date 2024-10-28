import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ErrorCyclicalDependencyFound, Graph } from '../src/Graph.js'

test('topologically sort a cyclical graph, throwing on cycles by default', () => {
	const graph = new Graph([
		['A', new Set(['B', 'C'])],
		['B', new Set(['D'])],
		['C', new Set(['D'])],
		['D', new Set(['A'])], // Add this line to create a cycle
	])
	//       A
	//      / \
	//     v   v
	//     B   C
	//      \ /
	//       v
	//       D -> A (cyclical)

	assert.throws(() => graph.sort(), ErrorCyclicalDependencyFound)
	assert.deepEqual(graph.sort(false), ['A', 'C', 'B', 'D'])
})
