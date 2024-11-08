import { test } from 'node:test'
import assert from 'node:assert/strict'
import { ErrorCyclicalDependencyFound, Graph } from '../src/Graph.js'

void test('link and unlink nodes on a graph', () => {
	const graph = new Graph().link('A', 'B', 'C')

	const node = graph.get('A')
	if (node == null) {
		return assert.fail('Failed to create the node "A" in the graph')
	}
	assert.ok(node.has('B'))
	assert.ok(node.has('C'))
	assert.ok(!node.has('D'))

	graph.link('A', 'D')

	assert.ok(node.has('D'))

	graph.unlink('A', 'B')
	assert.ok(!node.has('B'))

	graph.unlink('A')
	assert.equal(node.size, 0)
})

void test('topologically sort a cyclical graph, throwing on cycles by default', () => {
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
