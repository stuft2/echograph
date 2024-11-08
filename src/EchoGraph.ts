import { Graph } from './Graph.js'
import { EventEmitter } from './EventEmitter.js'

export class EchoGraph<EventName extends string> extends Graph {
	constructor(private readonly event: EventName) {
		super()
	}

	subscribe(parent: EventEmitter, ...children: EventEmitter[]): this {
		for (const child of children) {
			if (!(this.event in child)) {
				throw new TypeError(
					'The child emitter does not contain a method matching the event',
				)
			}
			/*
            referencing the function off the instance unbinds it from that context
            Docs: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
             */
			// @ts-expect-error
			const listener = child[this.event].bind(child)
			parent.on(this.event, listener)
		}
		this.link(parent.name, ...children.map((child) => child.name))
		return this
	}
}
