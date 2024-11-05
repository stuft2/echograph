import { test } from 'node:test'
import assert from 'node:assert/strict'
import { emit, EventEmitter } from '../src/EventEmitter.js'

test('add, resolve, and remove async listeners', async (t) => {
	const emitter = new EventEmitter('example')
	const event = 'test'
	const fn = t.mock.fn()

	// Nothing before subscribing
	assert.equal(emitter.subscriptions.size, 0)

	// Add a subscription
	emitter.on(event, fn)
	assert.equal(emitter.subscriptions.get(event)?.size, 1)

	// Invoke the event that is subscribed
	await emitter.emit(event)
	assert.equal(fn.mock.callCount(), 1)

	// Remove the subscription
	emitter.off(event, fn)
	assert.equal(emitter.subscriptions.get(event)?.size, 0)
})

test('decorate instance methods to emit a given event', async (t) => {
	class Component extends EventEmitter {
		constructor() {
			super('component')
		}

		@emit('refresh')
		async refresh () {
			return true
		}
	}

	const component = new Component()
	const listener = t.mock.fn()
	component.on('refresh', listener)

	assert.equal(
		component.subscriptions.get('refresh')?.size,
		1,
		'The refresh method listener was not subscribed',
	)

	const refreshed = await component.refresh()

	assert.ok(refreshed, 'Did not invoke the refresh method')
	assert.equal(
		listener.mock.callCount(),
		1,
		'Did not invoke the refresh method listener',
	)
})
