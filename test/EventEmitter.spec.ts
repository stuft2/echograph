import { test } from 'node:test'
import assert from 'node:assert/strict'
import { EventEmitter } from '../src/EventEmitter.js'

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
