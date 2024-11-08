/**
 * The async event listener signature
 */
export type Listener = (...args: any[]) => Promise<unknown> | unknown

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
		return this.subscriptions.get(event)
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
 * A decorator that emits the event along with the result of the decorated method. The event is emitted after the method resolves.
 * The decorated method is async will be mutated to return a Promise.
 * @param event - The event to emit at the end of the method invocation.
 */
export function emit(event?: string) {
	return function <
		This extends EventEmitter,
		Args extends unknown[],
		Return extends Promise<unknown>,
	>(
		target: (this: This, ...args: Args) => Return,
		context: ClassMethodDecoratorContext<
			This,
			(this: This, ...args: Args) => Return
		>,
	) {
		const eventName = event ?? (context.name as string)
		return async function (
			this: This,
			...args: Args
		): Promise<Awaited<Return>> {
			const result = await target.call(this, ...args)
			await this.emit(eventName, result)
			return result
		}
	}
}
