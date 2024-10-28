/**
 * An event emitter with async listeners. Uses sets instead of arrays to keep track of listeners.
 */
export class EventEmitter {
	public readonly subscriptions: Map<string, Set<Listener>> = new Map()

	constructor(public readonly name: string) {}

	async emit(event: string, ...args: unknown[]): Promise<void> {
		const listeners = this.listeners(event)
		if (listeners == null) return
		await Promise.all(
			Array.from(listeners).map((listener) => listener(...args)),
		)
	}

	listeners(event: string) {
		return this.subscriptions.get(event)?.values()
	}

	on(event: string, listener: Listener): this {
		if (!this.subscriptions.has(event)) {
			this.subscriptions.set(event, new Set())
		}
		this.subscriptions.get(event)?.add(listener)
		return this
	}

	off(event: string, listener: Listener): this {
		this.subscriptions.get(event)?.delete(listener)
		return this
	}
}

/**
 * The async event listener signature
 */
export type Listener = (...args: any[]) => Promise<void> | void
