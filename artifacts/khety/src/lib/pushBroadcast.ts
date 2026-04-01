/**
 * Singleton Supabase Realtime channel for push-prompt broadcasting.
 * One channel is shared across all components to avoid duplicate subscriptions.
 */
import { supabase } from "./supabase";

export const PUSH_BROADCAST_CHANNEL = "khety-push-prompt";
export const PUSH_BROADCAST_EVENT   = "request_push_permission";

type Listener = () => void;

let _channel: ReturnType<typeof supabase.channel> | null = null;
let _subscribed = false;
const _listeners: Set<Listener> = new Set();

function getChannel() {
  if (_channel) return _channel;

  _channel = supabase.channel(PUSH_BROADCAST_CHANNEL, {
    config: { broadcast: { ack: false } },
  });

  _channel
    .on("broadcast", { event: PUSH_BROADCAST_EVENT }, () => {
      _listeners.forEach((cb) => cb());
    })
    .subscribe((status) => {
      _subscribed = status === "SUBSCRIBED";
    });

  return _channel;
}

/** Register a callback that fires when the admin sends the broadcast. */
export function onPushBroadcast(callback: Listener): () => void {
  _listeners.add(callback);
  getChannel();
  return () => _listeners.delete(callback);
}

/** Send the push-prompt broadcast to all connected clients. */
export async function sendPushBroadcast(): Promise<void> {
  const ch = getChannel();

  // Wait up to 4 s for the channel to connect
  if (!_subscribed) {
    await new Promise<void>((resolve) => {
      const timer = setInterval(() => {
        if (_subscribed) { clearInterval(timer); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(timer); resolve(); }, 4000);
    });
  }

  await ch.send({
    type:    "broadcast",
    event:   PUSH_BROADCAST_EVENT,
    payload: { ts: Date.now() },
  });
}
