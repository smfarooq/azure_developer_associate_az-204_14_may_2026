import type { SeedQuestion } from "./types";

export const connectQuestions: SeedQuestion[] = [
  // ---------- API Management ----------
  {
    externalId: "connect-001",
    domain: "connect",
    topic: "API Management",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which APIM policy section runs BEFORE the request is forwarded to the backend?",
    options: [
      { text: "inbound", isCorrect: true, rationale: "Pre-backend; rewrite, auth, throttling." },
      { text: "backend", isCorrect: false, rationale: "Controls how the call is made to the backend." },
      { text: "outbound", isCorrect: false, rationale: "Runs after the backend response is received." },
      { text: "on-error", isCorrect: false, rationale: "Runs only on errors." },
    ],
    explanation:
      "APIM policy pipeline has four sections: inbound (validate JWT, rewrite URL, transform headers, rate-limit), backend (control the call: load balance, retry), outbound (transform response, set headers), on-error (handle exceptions). Policies inherit from product → API → operation scopes; use <base /> to chain.",
    reference: "https://learn.microsoft.com/azure/api-management/api-management-howto-policies",
    tags: ["apim", "policy"],
  },
  {
    externalId: "connect-002",
    domain: "connect",
    topic: "API Management",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which APIM policy enforces a request quota per subscription per hour?",
    options: [
      { text: "rate-limit-by-key", isCorrect: false, rationale: "Throttles short bursts, not hourly quotas." },
      { text: "quota-by-key", isCorrect: true, rationale: "Cumulative quotas over a longer period." },
      { text: "validate-jwt", isCorrect: false, rationale: "Validates tokens, not quotas." },
      { text: "set-backend-service", isCorrect: false, rationale: "Routing, not quotas." },
    ],
    explanation:
      "Throttling vs quota: rate-limit (or rate-limit-by-key) enforces short-window per-second/per-minute caps to absorb spikes. quota (or quota-by-key) enforces longer-window (hourly/daily/monthly) counters per subscription/user/key. They're complementary — use both for production APIs. The -by-key variants let you key off arbitrary expressions like context.Subscription.Id or a header.",
    reference: "https://learn.microsoft.com/azure/api-management/api-management-policies",
    tags: ["apim", "throttling"],
  },
  {
    externalId: "connect-003",
    domain: "connect",
    topic: "API Management",
    difficulty: "medium",
    type: "single",
    prompt:
      "You want APIM to call a backend using a managed identity for authentication. Which policy applies the MI access token to the backend call?",
    options: [
      { text: "send-request", isCorrect: false, rationale: "Generic outbound HTTP call from policy." },
      { text: "authentication-managed-identity", isCorrect: true, rationale: "Adds Authorization: Bearer <MI token> to the backend call." },
      { text: "validate-jwt", isCorrect: false, rationale: "Validates inbound JWTs." },
      { text: "set-header Authorization", isCorrect: false, rationale: "Would need a token to set; the policy above produces and sets one." },
    ],
    explanation:
      "<authentication-managed-identity resource=\"<target-app-id-uri-or-resource>\" /> acquires a token using the APIM instance's managed identity for the named resource and sets the Authorization header on the backend request. The target Azure resource must accept Entra tokens (e.g., a Function App with Easy Auth, or any service with Entra-protected endpoints).",
    reference: "https://learn.microsoft.com/azure/api-management/api-management-authentication-policies",
    tags: ["apim", "managed-identity"],
  },
  {
    externalId: "connect-004",
    domain: "connect",
    topic: "API Management",
    difficulty: "hard",
    type: "single",
    prompt:
      "A consumer-facing APIM developer portal must allow self-service sign-up via Microsoft Entra ID accounts. Which feature do you configure?",
    options: [
      { text: "Products without subscriptions", isCorrect: false, rationale: "Doesn't address auth identity." },
      { text: "Identity provider for Microsoft Entra in the developer portal settings", isCorrect: true, rationale: "Enables federated sign-up/sign-in." },
      { text: "Validate-jwt on every API", isCorrect: false, rationale: "Backend protection, not portal sign-up." },
      { text: "Microsoft Entra B2C only", isCorrect: false, rationale: "B2C is for external/customer identities; the question is workforce Entra." },
    ],
    explanation:
      "The APIM developer portal supports several identity providers — username/password, Entra ID, Entra ID B2C, social IdPs. Configure 'Identities' under the portal settings, add the Entra IdP with its app registration, optionally restrict to specific tenants. You can also limit sign-up by group claims or invite-only modes via the API.",
    reference: "https://learn.microsoft.com/azure/api-management/api-management-howto-aad",
    tags: ["apim", "portal", "entra"],
  },
  {
    externalId: "connect-005",
    domain: "connect",
    topic: "API Management",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which APIM tier supports VNet integration (internal and external modes) and custom domains on the developer portal at the lowest cost?",
    options: [
      { text: "Consumption", isCorrect: false, rationale: "No VNet integration." },
      { text: "Developer", isCorrect: false, rationale: "Supports VNet, but is not for production (no SLA)." },
      { text: "Basic / Standard v2", isCorrect: false, rationale: "Various tiers — v2 brings VNet to lower SKUs." },
      { text: "Premium (and now Standard v2 / Premium v2 with newer features)", isCorrect: true, rationale: "Premium has full VNet + multi-region; v2 SKUs expanded VNet to lower tiers." },
    ],
    explanation:
      "Historically VNet integration required Premium. Microsoft has introduced v2 SKUs (Standard v2, Premium v2) that bring VNet integration to lower tiers at lower cost. For multi-region deployments and self-hosted gateway, Premium is still the canonical choice. Always check current tier comparisons because this area changes rapidly.",
    reference: "https://learn.microsoft.com/azure/api-management/api-management-features",
    tags: ["apim", "tiers"],
  },

  // ---------- Event Grid ----------
  {
    externalId: "connect-010",
    domain: "connect",
    topic: "Event Grid",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which best characterizes Azure Event Grid?",
    options: [
      { text: "Message broker with ordered FIFO queues and sessions", isCorrect: false, rationale: "That is Service Bus." },
      { text: "Push-based event router with at-least-once delivery and retries", isCorrect: true, rationale: "Event Grid's purpose." },
      { text: "Telemetry ingestion pipeline for millions of events per second", isCorrect: false, rationale: "Event Hubs is for high-throughput streaming." },
      { text: "Workflow orchestration with stateful designer", isCorrect: false, rationale: "Logic Apps." },
    ],
    explanation:
      "Pick the messaging service by intent. Event Grid: reactive event routing (push to many subscribers, filter, retry, dead-letter). Event Hubs: high-throughput streaming/telemetry. Service Bus: enterprise messaging (FIFO, sessions, transactions, DLQ). Storage Queues: simple low-cost queue. Logic Apps: low-code workflow orchestration.",
    reference: "https://learn.microsoft.com/azure/event-grid/compare-messaging-services",
    tags: ["event-grid", "messaging"],
  },
  {
    externalId: "connect-011",
    domain: "connect",
    topic: "Event Grid",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Event Grid concept REPRESENTS a source of events (e.g., a storage account or custom app)?",
    options: [
      { text: "Topic", isCorrect: true, rationale: "Source endpoint; custom or system." },
      { text: "Subscription", isCorrect: false, rationale: "Destination + filter configuration." },
      { text: "Event handler", isCorrect: false, rationale: "Target of the subscription." },
      { text: "Schema", isCorrect: false, rationale: "Event format definition." },
    ],
    explanation:
      "Event Grid model: Source (storage account, custom app, etc.) emits events to a Topic (system topic for Azure resources or custom topic for your own events). Subscriptions filter events from a topic and forward them to a Handler (Functions, Webhook, Event Hubs, Service Bus queue/topic, Storage Queue, Hybrid Connection). The CloudEvents 1.0 schema is now the recommended event format.",
    reference: "https://learn.microsoft.com/azure/event-grid/concepts",
    tags: ["event-grid", "topics"],
  },
  {
    externalId: "connect-012",
    domain: "connect",
    topic: "Event Grid",
    difficulty: "hard",
    type: "single",
    prompt:
      "Your Event Grid webhook handler returns 503 occasionally. What happens to those events?",
    options: [
      { text: "Discarded immediately", isCorrect: false, rationale: "Event Grid retries first." },
      { text: "Retried with exponential backoff; dead-lettered to a configured storage container if retries exhaust", isCorrect: true, rationale: "Standard Event Grid behavior." },
      { text: "Re-routed to another handler automatically", isCorrect: false, rationale: "Routing is determined by subscriptions, not failures." },
      { text: "Held forever in the topic", isCorrect: false, rationale: "There is a retention window (24h default)." },
    ],
    explanation:
      "Event Grid retries failed delivery with exponential backoff for up to 24 hours by default (configurable per subscription). When retries exhaust, events go to the dead-letter location (a storage container you specify on the subscription). Monitor dead-letter counts with Azure Monitor metrics and process them via a recovery handler.",
    reference: "https://learn.microsoft.com/azure/event-grid/delivery-and-retry",
    tags: ["event-grid", "retry", "dead-letter"],
  },
  {
    externalId: "connect-013",
    domain: "connect",
    topic: "Event Grid",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which validation handshake must a custom webhook implement to receive Event Grid events?",
    options: [
      { text: "Reply to a SubscriptionValidationEvent by echoing the validation code", isCorrect: true, rationale: "Default validation." },
      { text: "Set a 'X-Event-Grid-Token' header on every response", isCorrect: false, rationale: "Not a thing." },
      { text: "Validate-jwt on every request", isCorrect: false, rationale: "EG doesn't use JWT for delivery validation by default." },
      { text: "Use mutual TLS", isCorrect: false, rationale: "Not required (handshake is HTTP)." },
    ],
    explanation:
      "When you create a webhook subscription, Event Grid sends a SubscriptionValidationEvent (Microsoft.EventGrid.SubscriptionValidationEvent). The endpoint must respond synchronously with the validationCode in the body — or implement manual validation via a one-time URL. The Azure Functions Event Grid trigger handles this automatically.",
    reference: "https://learn.microsoft.com/azure/event-grid/webhook-event-delivery",
    tags: ["event-grid", "webhook", "validation"],
  },

  // ---------- Event Hubs ----------
  {
    externalId: "connect-020",
    domain: "connect",
    topic: "Event Hubs",
    difficulty: "easy",
    type: "single",
    prompt:
      "Event Hubs partitions enable scalability. What controls which partition an event lands in?",
    options: [
      { text: "Round-robin only", isCorrect: false, rationale: "Default when no PartitionKey is set; not the controlling mechanism overall." },
      { text: "PartitionKey on the event (hashed) or explicit partition ID", isCorrect: true, rationale: "Two ways to direct events." },
      { text: "Producer's IP address", isCorrect: false, rationale: "Not used." },
      { text: "Consumer group", isCorrect: false, rationale: "Consumer-side concept." },
    ],
    explanation:
      "Producers can send events with (a) no key — round-robin to available partitions, (b) a PartitionKey (string) hashed to a partition (good for ordering by key), or (c) an explicit partition ID (rare; couples producer to partition layout). Consumer groups give independent views to multiple downstream apps; each consumer in a group is assigned partitions exclusively.",
    reference: "https://learn.microsoft.com/azure/event-hubs/event-hubs-features",
    tags: ["event-hubs", "partitions"],
  },
  {
    externalId: "connect-021",
    domain: "connect",
    topic: "Event Hubs",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Event Hubs feature lets a consumer easily resume from where it left off after a restart?",
    options: [
      { text: "Capture", isCorrect: false, rationale: "Persists to Blob/ADLS for batch; not consumer state." },
      { text: "Checkpoint store (Blob storage container per consumer group)", isCorrect: true, rationale: "EventProcessorClient stores checkpoints there." },
      { text: "Schema registry", isCorrect: false, rationale: "Schema validation for messages." },
      { text: "Dead-letter queue", isCorrect: false, rationale: "Event Hubs doesn't have a DLQ." },
    ],
    explanation:
      "The EventProcessorClient writes the last successfully processed offset/sequence number per partition to a checkpoint Blob container. On restart it picks up from those offsets. Capture is separate — it persists ingest streams to Blob/ADLS for downstream batch jobs, completely independent from your consumer code.",
    reference: "https://learn.microsoft.com/azure/event-hubs/event-hubs-event-processor-host",
    tags: ["event-hubs", "checkpoint", "consumer"],
  },
  {
    externalId: "connect-022",
    domain: "connect",
    topic: "Event Hubs",
    difficulty: "hard",
    type: "single",
    prompt:
      "Comparing Event Hubs vs IoT Hub for telemetry ingestion from a million devices, which key feature does IoT Hub provide that Event Hubs does not?",
    options: [
      { text: "Higher throughput", isCorrect: false, rationale: "Event Hubs typically scales higher than IoT Hub." },
      { text: "Per-device identity and bidirectional cloud-to-device messaging", isCorrect: true, rationale: "IoT Hub's purpose." },
      { text: "AMQP support", isCorrect: false, rationale: "Both support AMQP." },
      { text: "Capture to Blob storage", isCorrect: false, rationale: "Event Hubs Capture is the simpler option." },
    ],
    explanation:
      "Event Hubs is pure ingest (cloud-to-cloud or one-way device→cloud). IoT Hub adds per-device identity registry, device twins (state sync), direct methods (synchronous cloud→device), file uploads, jobs, and managed device-side SDKs. Choose IoT Hub when you need device management or cloud-to-device messaging; Event Hubs when you only need raw ingest at high throughput.",
    reference: "https://learn.microsoft.com/azure/iot-hub/iot-hub-compare-event-hubs",
    tags: ["event-hubs", "iot-hub"],
  },

  // ---------- Service Bus ----------
  {
    externalId: "connect-030",
    domain: "connect",
    topic: "Service Bus",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Service Bus entity supports publish-subscribe with multiple subscribers each receiving a filtered copy of messages?",
    options: [
      { text: "Queue", isCorrect: false, rationale: "Point-to-point." },
      { text: "Topic + Subscription", isCorrect: true, rationale: "Pub-sub with filters." },
      { text: "Event Hub", isCorrect: false, rationale: "Different service." },
      { text: "Relay", isCorrect: false, rationale: "Hybrid networking, not pub-sub." },
    ],
    explanation:
      "Service Bus has queues (point-to-point) and topics (pub-sub). Each topic has one or more subscriptions; subscriptions can have SQL or correlation filters to receive only matching messages. From a consumer perspective, a subscription behaves like a queue — same APIs, same features (sessions, dead-letter, transactions).",
    reference: "https://learn.microsoft.com/azure/service-bus-messaging/service-bus-queues-topics-subscriptions",
    tags: ["service-bus", "topics"],
  },
  {
    externalId: "connect-031",
    domain: "connect",
    topic: "Service Bus",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which features are available in Service Bus Standard but NOT in Queue Storage? Select all that apply.",
    options: [
      { text: "Sessions (ordered messages by session ID)", isCorrect: true, rationale: "Service Bus only." },
      { text: "Dead-letter queue (built-in)", isCorrect: true, rationale: "Service Bus has explicit DLQ." },
      { text: "Topics + subscriptions (pub-sub)", isCorrect: true, rationale: "Service Bus only." },
      { text: "Transactions across multiple operations", isCorrect: true, rationale: "Service Bus supports transactions." },
      { text: "Message size up to 64 KB only", isCorrect: false, rationale: "Service Bus supports up to 256 KB (Standard) / 100 MB (Premium)." },
    ],
    explanation:
      "Queue Storage = simple low-cost (64 KB messages, basic FIFO-ish, no DLQ). Service Bus = enterprise (sessions, DLQ, transactions, topics, dup detection, auto-forward, scheduled messages, deferred messages, larger payloads). Pick Queue Storage for cheap async tasking and Service Bus when you need any of the enterprise features.",
    reference: "https://learn.microsoft.com/azure/service-bus-messaging/service-bus-azure-and-service-bus-queues-compared-contrasted",
    tags: ["service-bus", "comparison"],
  },
  {
    externalId: "connect-032",
    domain: "connect",
    topic: "Service Bus",
    difficulty: "medium",
    type: "single",
    prompt:
      "A message has been received but processing fails after partial work. The receiver wants the message to be re-delivered after a short delay. Which action is most idiomatic?",
    options: [
      { text: "Complete the message and re-enqueue manually", isCorrect: false, rationale: "Loses message identity and dup-detection." },
      { text: "Abandon the message; it becomes available again after the lock expires", isCorrect: true, rationale: "Standard pattern; delivery count increments." },
      { text: "Dead-letter it immediately", isCorrect: false, rationale: "Only after retries exhausted." },
      { text: "Defer it", isCorrect: false, rationale: "Defer requires explicit re-receive by sequence number." },
    ],
    explanation:
      "Receiver outcomes: Complete (remove from queue), Abandon (release lock; message redelivered to any receiver, deliveryCount increments), Dead-letter (move to DLQ with reason), Defer (set aside until explicitly retrieved by sequence number). On transient failure, Abandon; the broker will redeliver. When MaxDeliveryCount is exceeded the message auto-dead-letters.",
    reference: "https://learn.microsoft.com/azure/service-bus-messaging/message-transfers-locks-settlement",
    tags: ["service-bus", "lock", "retry"],
  },
  {
    externalId: "connect-033",
    domain: "connect",
    topic: "Service Bus",
    difficulty: "hard",
    type: "single",
    prompt:
      "Which Service Bus capability ensures duplicate messages produced within a time window are detected and ignored automatically?",
    options: [
      { text: "Sessions", isCorrect: false, rationale: "Ordering, not dedup." },
      { text: "Duplicate detection on the queue/topic with a configurable window", isCorrect: true, rationale: "Exact feature; uses MessageId." },
      { text: "ForwardTo configuration", isCorrect: false, rationale: "Routing, not dedup." },
      { text: "Auto-delete on idle", isCorrect: false, rationale: "Cleanup feature." },
    ],
    explanation:
      "Enable RequiresDuplicateDetection on the queue/topic and set DuplicateDetectionHistoryTimeWindow (e.g., 10 minutes). When messages have the same MessageId within that window, all but the first are silently ignored. The receiver never sees them. This trades broker CPU/memory for an at-most-once illusion despite at-least-once producer semantics.",
    reference: "https://learn.microsoft.com/azure/service-bus-messaging/duplicate-detection",
    tags: ["service-bus", "dedup"],
  },
  {
    externalId: "connect-034",
    domain: "connect",
    topic: "Service Bus",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Service Bus feature lets a sender schedule a message to be delivered at a future time without holding the connection?",
    options: [
      { text: "Scheduled messages (SequenceNumber returned for cancellation)", isCorrect: true, rationale: "Built-in scheduling primitive." },
      { text: "Sessions with a Sleep header", isCorrect: false, rationale: "No such mechanism." },
      { text: "Logic Apps timer trigger", isCorrect: false, rationale: "External, not Service Bus." },
      { text: "Auto-delete on idle", isCorrect: false, rationale: "Cleanup feature." },
    ],
    explanation:
      "Service Bus supports scheduled messages: send a message with ScheduledEnqueueTimeUtc in the future and the broker stores it, making it visible at that time. The send returns a SequenceNumber so you can cancel later with ScheduleCancellation. Useful for delays, retries with backoff, or domain-driven 'remind me' patterns.",
    reference: "https://learn.microsoft.com/azure/service-bus-messaging/message-sequencing",
    tags: ["service-bus", "scheduled"],
  },

  // ---------- Logic Apps ----------
  {
    externalId: "connect-040",
    domain: "connect",
    topic: "Logic Apps",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Logic Apps hosting plan supports VNet integration, local development, and per-app scaling using the Functions runtime under the hood?",
    options: [
      { text: "Consumption", isCorrect: false, rationale: "Multi-tenant; no VNet, runs in a service plan you don't own." },
      { text: "Standard (single-tenant)", isCorrect: true, rationale: "Built on Functions; full VNet and local dev." },
      { text: "Integration Service Environment v1", isCorrect: false, rationale: "Deprecated; ISE was the predecessor." },
      { text: "On-prem data gateway", isCorrect: false, rationale: "A connector type, not a hosting plan." },
    ],
    explanation:
      "Logic Apps comes in two main models: Consumption (multi-tenant, pay-per-action, simple) and Standard (single-tenant, runs on the same host as Azure Functions, supports VNet, local debugging with VS Code, stateful + stateless workflows in one app). ISE is deprecated. The on-prem data gateway is a connector mechanism, not a host model.",
    reference: "https://learn.microsoft.com/azure/logic-apps/logic-apps-overview",
    tags: ["logic-apps", "hosting"],
  },
  {
    externalId: "connect-041",
    domain: "connect",
    topic: "Logic Apps",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Logic Apps workflow type can scale to zero instances and bills per execution + connector calls?",
    options: [
      { text: "Standard stateful workflow", isCorrect: false, rationale: "Hosted on Standard plan with reserved compute." },
      { text: "Standard stateless workflow", isCorrect: false, rationale: "Same plan as above." },
      { text: "Consumption workflow", isCorrect: true, rationale: "Pay per action; scales fully managed." },
      { text: "Integration Account workflow", isCorrect: false, rationale: "Integration Accounts are a B2B add-on, not a workflow type." },
    ],
    explanation:
      "Consumption Logic Apps are fully serverless: pay per action and per connector call, no plan to manage. Standard runs your workflows on a Functions-style host you scale. Pick Consumption for ad-hoc, low-volume orchestrations; Standard for high volume, VNet, predictable cost, or stateful+stateless mix in one app.",
    reference: "https://learn.microsoft.com/azure/logic-apps/single-tenant-overview-compare",
    tags: ["logic-apps", "billing"],
  },
];
