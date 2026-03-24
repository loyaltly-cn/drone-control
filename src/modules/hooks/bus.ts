type Handler<T = any> = (data: T) => void;

class EventBus {
    private handlers = new Map<string, Set<Handler>>();

    on<T>(event: string, handler: Handler<T>): () => void {
        if (!this.handlers.has(event)) this.handlers.set(event, new Set());
        this.handlers.get(event)!.add(handler);
        return () => this.handlers.get(event)?.delete(handler);
    }

    emit<T>(event: string, data: T): void {
        this.handlers.get(event)?.forEach(h => {
            try { h(data); } catch(e) { console.error(e); }
        });
    }

    off(event: string): void {
        this.handlers.delete(event);
    }
}

export const bus = new EventBus();
