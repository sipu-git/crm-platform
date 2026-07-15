import { EventEmitter } from 'events';

/**
 * In-process event bus — the seam between modules. Modules never import
 * each other's services directly; they emit/listen to events here.
 * If a module is ever split into its own service, only this file's
 * implementation needs to change (e.g. to Redis pub/sub) — no module
 * that emits or listens needs to change.
 */
class EventBus extends EventEmitter {}

export const eventBus = new EventBus();
eventBus.setMaxListeners(50);

// Central place to see every domain event in the system at a glance.
export type DomainEvent =
  | 'lead.created'
  | 'lead.qualified'
  | 'lead.disqualified'
  | 'lead.converted'
  | 'deal.created'
  | 'deal.stage_changed'
  | 'deal.won'
  | 'deal.lost'
  | 'invoice.created'
  | 'invoice.paid'
  | 'activity.created'
  | 'user.registered';
