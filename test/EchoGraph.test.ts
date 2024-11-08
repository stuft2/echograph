import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EchoGraph } from '../src/EchoGraph'
import { EventEmitter, emit } from '../src/EventEmitter.js'

void test('graph and subscribe dependencies', async (t) => {
	class Component extends EventEmitter {
		refreshCallCount = 0
		@emit()
		async refresh() {
			this.refreshCallCount++
			return true
		}
	}

	const emitter = new Component('emitter')
	const listener = new Component('listener')
	const graph = new EchoGraph('refresh').subscribe(emitter, listener)

	await emitter.refresh()
	assert.equal(
		emitter.refreshCallCount,
		1,
		`The ${emitter.name} refresh was not invoked`,
	)
	assert.equal(
		listener.refreshCallCount,
		1,
		`The ${listener.name} refresh was not invoked`,
	)
	assert.equal(graph.size, 1, 'Expected the graph to have one node')
	assert.equal(
		graph.get(emitter.name)?.size,
		1,
		'Expected the parent node to have one edge',
	)
	assert.deepEqual(graph.sort(), ['emitter', 'listener'])
})
