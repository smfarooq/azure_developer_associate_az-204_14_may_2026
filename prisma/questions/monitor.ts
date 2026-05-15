import type { SeedQuestion } from "./types";

export const monitorQuestions: SeedQuestion[] = [
  // ---------- Application Insights ----------
  {
    externalId: "monitor-001",
    domain: "monitor",
    topic: "Application Insights",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Application Insights telemetry type represents a request handled by the server-side app (e.g., an HTTP endpoint)?",
    options: [
      { text: "Trace", isCorrect: false, rationale: "Generic log/diagnostic message." },
      { text: "Dependency", isCorrect: false, rationale: "Outbound call to another service." },
      { text: "Request", isCorrect: true, rationale: "Incoming request to your app." },
      { text: "PageView", isCorrect: false, rationale: "Client-side browser page load." },
    ],
    explanation:
      "Application Insights telemetry types: Request (server-side incoming), Dependency (outbound call from your app), Trace (log message), Exception, CustomEvent, CustomMetric, PageView (browser), and Availability (synthetic test). End-to-end transactions correlate requests with their dependencies via the operation_Id correlation field.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/app/data-model-complete",
    tags: ["app-insights", "telemetry"],
  },
  {
    externalId: "monitor-002",
    domain: "monitor",
    topic: "Application Insights",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your App Insights bill is too high. Which feature reduces ingestion volume while preserving statistically accurate metrics and correlated traces?",
    options: [
      { text: "Disable telemetry entirely", isCorrect: false, rationale: "Loses observability." },
      { text: "Adaptive sampling", isCorrect: true, rationale: "Reduces telemetry while preserving correlation and accurate counts." },
      { text: "Increase the daily cap", isCorrect: false, rationale: "Increases the bill instead of reducing it." },
      { text: "Send only Exception telemetry", isCorrect: false, rationale: "Loses request/dependency view." },
    ],
    explanation:
      "Adaptive sampling — enabled by default in the .NET ASP.NET Core SDK — automatically samples to stay under a target events-per-second. Samples preserve correlated transactions (request + its dependencies + exceptions are kept together) and metrics are extrapolated. Daily cap is a hard limit that DROPS telemetry once reached (an emergency brake, not a tuning lever).",
    reference: "https://learn.microsoft.com/azure/azure-monitor/app/sampling",
    tags: ["app-insights", "sampling", "cost"],
  },
  {
    externalId: "monitor-003",
    domain: "monitor",
    topic: "Application Insights",
    difficulty: "medium",
    type: "single",
    prompt:
      "You want to enrich telemetry with the build version on every event. What is the correct extension point?",
    options: [
      { text: "TelemetryInitializer", isCorrect: true, rationale: "Modify EVERY telemetry item before send." },
      { text: "TelemetryProcessor", isCorrect: false, rationale: "Used for filtering/dropping; runs after initializers." },
      { text: "TelemetryClient.TrackEvent for each one", isCorrect: false, rationale: "Doesn't enrich existing events." },
      { text: "Static field on the SDK", isCorrect: false, rationale: "Not the intended pattern." },
    ],
    explanation:
      "TelemetryInitializer: called for every telemetry item, used to add or modify properties (e.g., version, role, environment). TelemetryProcessor: chained processors that can DROP or transform items — used for custom sampling or filtering. Register both via DI on .NET. For build version, implement ITelemetryInitializer and set telemetry.Context.Component.Version (or a custom property).",
    reference: "https://learn.microsoft.com/azure/azure-monitor/app/api-filtering-sampling",
    tags: ["app-insights", "initializer"],
  },
  {
    externalId: "monitor-004",
    domain: "monitor",
    topic: "Application Insights",
    difficulty: "hard",
    type: "single",
    prompt:
      "Distributed tracing across multiple Azure services correlates events using which header standard by default in modern Azure SDKs?",
    options: [
      { text: "X-Correlation-ID custom header", isCorrect: false, rationale: "Custom convention; not the SDK default." },
      { text: "W3C Trace Context (traceparent and tracestate)", isCorrect: true, rationale: "Standard adopted by OpenTelemetry and Azure SDK." },
      { text: "Request-Id only (legacy)", isCorrect: false, rationale: "Older AI convention; still supported but not the modern default." },
      { text: "Operation-Id query parameter", isCorrect: false, rationale: "Internal field, not propagated this way." },
    ],
    explanation:
      "Modern Azure SDKs and OpenTelemetry use the W3C Trace Context standard. Two headers propagate: 'traceparent' (version-trace_id-span_id-flags) and 'tracestate' (vendor info). Application Insights' classic Request-Id header is still accepted but new instrumentation prefers W3C. End-to-end views in the portal stitch transactions using these headers.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/app/distributed-tracing",
    tags: ["app-insights", "tracing", "w3c"],
  },

  // ---------- Log Analytics / KQL ----------
  {
    externalId: "monitor-010",
    domain: "monitor",
    topic: "KQL",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which KQL operator filters rows based on a condition?",
    options: [
      { text: "project", isCorrect: false, rationale: "Selects/renames columns." },
      { text: "where", isCorrect: true, rationale: "Row filter — equivalent to SQL WHERE." },
      { text: "summarize", isCorrect: false, rationale: "Aggregation." },
      { text: "extend", isCorrect: false, rationale: "Adds computed columns." },
    ],
    explanation:
      "KQL fundamentals: where filters rows, project selects/renames/computes columns, extend adds columns without dropping others, summarize aggregates with grouping, join combines tables, render visualizes. Order matters — applying where early reduces data scanned downstream.",
    reference: "https://learn.microsoft.com/azure/data-explorer/kusto/query/whereoperator",
    tags: ["kql", "log-analytics"],
  },
  {
    externalId: "monitor-011",
    domain: "monitor",
    topic: "KQL",
    difficulty: "medium",
    type: "single",
    prompt:
      "Write a KQL snippet that shows the top 5 URLs with the most 5xx responses in the last hour. Which query is correct?",
    code: "// Pick the correct query\n// (a)\nrequests\n| where timestamp > ago(1h)\n| where resultCode startswith \"5\"\n| summarize count() by url\n| top 5 by count_\n\n// (b)\nrequests\n| project url\n| where resultCode == 5\n| count\n\n// (c)\nrequests\n| where ago(1h)\n| summarize count() by *\n\n// (d)\nrequests\n| order by url\n| take 5",
    codeLanguage: "kusto",
    options: [
      { text: "(a)", isCorrect: true, rationale: "Filters time + 5xx, groups by url, top N." },
      { text: "(b)", isCorrect: false, rationale: "Wrong comparison; loses url after project; missing time filter." },
      { text: "(c)", isCorrect: false, rationale: "where ago(1h) is a syntax error." },
      { text: "(d)", isCorrect: false, rationale: "Just sorts and takes — doesn't aggregate." },
    ],
    explanation:
      "Query (a) is the canonical pattern: filter early on time and resultCode (note: resultCode is a string in requests; using startswith \"5\" matches 500/502/503/etc.), summarize by URL, then top N by the count. summarize generates count_ by default; reference it in 'top' or use 'top 5 by count_ desc'.",
    reference: "https://learn.microsoft.com/azure/data-explorer/kusto/query/tutorial",
    tags: ["kql", "examples"],
  },
  {
    externalId: "monitor-012",
    domain: "monitor",
    topic: "Log Analytics",
    difficulty: "medium",
    type: "single",
    prompt:
      "How does Application Insights store data starting with the workspace-based mode?",
    options: [
      { text: "In a standalone resource separate from Log Analytics", isCorrect: false, rationale: "That was the classic mode, now deprecated for new resources." },
      { text: "Inside a Log Analytics workspace as standard tables", isCorrect: true, rationale: "Workspace-based mode stores AI telemetry in a Log Analytics workspace." },
      { text: "In blob storage with no query layer", isCorrect: false, rationale: "False." },
      { text: "In Cosmos DB", isCorrect: false, rationale: "False." },
    ],
    explanation:
      "Classic Application Insights resources stored data separately. Workspace-based AI (now the default for new resources) writes telemetry into a Log Analytics workspace as standard tables (AppRequests, AppDependencies, AppExceptions, AppTraces, ...). This unifies retention, RBAC, query, and cross-resource analytics with VMs, AKS, and other Azure Monitor sources.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/app/create-workspace-resource",
    tags: ["app-insights", "log-analytics", "workspace"],
  },

  // ---------- Autoscale ----------
  {
    externalId: "monitor-020",
    domain: "monitor",
    topic: "Autoscale",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which autoscale rule type adds capacity ahead of an expected business event (e.g., daily peak hours)?",
    options: [
      { text: "Metric-based rule on CPU", isCorrect: false, rationale: "Reactive; lags behind demand." },
      { text: "Schedule-based (time-based) rule", isCorrect: true, rationale: "Pre-warms capacity for known windows." },
      { text: "Webhook autoscale", isCorrect: false, rationale: "Notifies external systems but doesn't proactively scale." },
      { text: "Manual scaling only", isCorrect: false, rationale: "No automation." },
    ],
    explanation:
      "Azure Autoscale combines metric-based rules (reactive — scale out when CPU > X for N minutes) with schedule-based profiles (e.g., business hours profile with higher floor, weekend profile lower). Use schedule-based to absorb predictable peaks without waiting for metrics to trigger, and metric-based as backup for unexpected demand.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/autoscale/autoscale-overview",
    tags: ["autoscale", "scaling"],
  },
  {
    externalId: "monitor-021",
    domain: "monitor",
    topic: "Autoscale",
    difficulty: "hard",
    type: "single",
    prompt:
      "An App Service Plan oscillates rapidly between 2 and 4 instances. Which autoscale property tames this?",
    options: [
      { text: "Increase the minimum instance count", isCorrect: false, rationale: "Doesn't stop oscillation." },
      { text: "Cool-down period (and asymmetric thresholds)", isCorrect: true, rationale: "Prevents back-to-back actions; asymmetric scale-out vs scale-in thresholds reduce flapping." },
      { text: "Increase the max instance count", isCorrect: false, rationale: "Doesn't stop oscillation." },
      { text: "Switch to Premium plan", isCorrect: false, rationale: "Pricing change, not the cause." },
    ],
    explanation:
      "Flapping typically comes from thresholds that are too close (e.g., scale out at CPU > 70 and scale in at CPU < 65 — the system bounces). Two mitigations: (1) widen the gap (scale out at 70, scale in at 40); (2) increase the cool-down so no action happens within N minutes of the prior one. Most well-behaved policies use both.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/autoscale/autoscale-best-practices",
    tags: ["autoscale", "flapping"],
  },

  // ---------- Cache / CDN ----------
  {
    externalId: "monitor-030",
    domain: "monitor",
    topic: "Azure Cache for Redis",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Azure Cache for Redis tier is the minimum to get SLA-backed redundancy with replicated nodes?",
    options: [
      { text: "Basic", isCorrect: false, rationale: "Single node; no SLA." },
      { text: "Standard", isCorrect: true, rationale: "Primary+replica; 99.9% SLA." },
      { text: "Premium", isCorrect: false, rationale: "Adds clustering/persistence/VNet; not the minimum for SLA." },
      { text: "Enterprise", isCorrect: false, rationale: "Adds Redis Modules and active-active." },
    ],
    explanation:
      "Tiers: Basic (single node, no SLA), Standard (primary+replica, 99.9%), Premium (clustering, persistence, VNet injection, geo-replication), Enterprise / Enterprise Flash (Redis on Flash, Redis Modules like RedisJSON / Search / Bloom, active geo-replication). Pick at least Standard for any production-like workload.",
    reference: "https://learn.microsoft.com/azure/azure-cache-for-redis/cache-overview",
    tags: ["redis", "tiers"],
  },
  {
    externalId: "monitor-031",
    domain: "monitor",
    topic: "Azure Cache for Redis",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which caching patterns are commonly implemented with Azure Cache for Redis? Select all that apply.",
    options: [
      { text: "Cache-aside (lazy loading)", isCorrect: true, rationale: "App reads cache, on miss reads DB and populates." },
      { text: "Read-through with a thin caching layer in front of the DB", isCorrect: true, rationale: "Library handles miss/load." },
      { text: "Write-through", isCorrect: true, rationale: "Write to cache and DB simultaneously." },
      { text: "Session state store", isCorrect: true, rationale: "Common use; supports distributed sessions." },
      { text: "Source of truth for transactional data", isCorrect: false, rationale: "Cache, not durable primary store." },
    ],
    explanation:
      "Common Redis patterns: cache-aside (app does the work — most common), read-through / write-through (library transparently fronts the DB), write-behind (queue writes for later), session state, distributed lock (with RedLock; use cautiously), pub/sub, and rate limiting. Redis can be configured with persistence (RDB / AOF) but should not be your authoritative store for critical data.",
    reference: "https://learn.microsoft.com/azure/architecture/patterns/cache-aside",
    tags: ["redis", "patterns"],
  },
  {
    externalId: "monitor-032",
    domain: "monitor",
    topic: "Azure Cache for Redis",
    difficulty: "medium",
    type: "single",
    prompt:
      "What is the recommended way to authenticate to Azure Cache for Redis without a connection-string password?",
    options: [
      { text: "Use the access keys in App Settings", isCorrect: false, rationale: "Avoids the question — still password." },
      { text: "Microsoft Entra authentication for Redis (preview/GA depending on tier)", isCorrect: true, rationale: "Modern recommendation." },
      { text: "Client certificate", isCorrect: false, rationale: "Not the redis auth mechanism." },
      { text: "SAS token", isCorrect: false, rationale: "Storage construct, not redis." },
    ],
    explanation:
      "Azure Cache for Redis now supports Microsoft Entra authentication on Enterprise and Standard/Premium tiers. The pattern: enable Entra auth, assign data-plane roles ('Data Owner', 'Data Contributor', 'Data Reader'), and connect using a credential like ManagedIdentityCredential to retrieve a token. This replaces long-lived access keys for code that has a managed identity.",
    reference: "https://learn.microsoft.com/azure/azure-cache-for-redis/cache-azure-active-directory-for-authentication",
    tags: ["redis", "entra", "auth"],
  },
  {
    externalId: "monitor-033",
    domain: "monitor",
    topic: "CDN",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your dynamic site uses Azure Front Door. Which feature lets you ROUTE traffic to different backends based on URL path?",
    options: [
      { text: "Rules engine", isCorrect: false, rationale: "Modifies requests/responses; routing uses route definitions." },
      { text: "Route with associated patterns to match", isCorrect: true, rationale: "Routes define path patterns mapping to origin groups." },
      { text: "Custom domains", isCorrect: false, rationale: "Public hostname binding." },
      { text: "WAF policy", isCorrect: false, rationale: "Security control." },
    ],
    explanation:
      "Front Door routing model: Endpoint → Route → Origin group → Origins. Routes match host + path patterns and pick the origin group, plus options like caching, https redirect, compression. Rules engine lets you further modify the request/response or override routing decisions per condition. WAF policies attach to endpoints/domains for L7 protection.",
    reference: "https://learn.microsoft.com/azure/frontdoor/front-door-routing-architecture",
    tags: ["front-door", "routing"],
  },
  {
    externalId: "monitor-034",
    domain: "monitor",
    topic: "CDN",
    difficulty: "medium",
    type: "single",
    prompt:
      "You need to purge a single object from Azure Front Door's cache after publishing a new version. Which command is correct?",
    options: [
      { text: "az afd endpoint purge --content-paths /images/logo.png", isCorrect: true, rationale: "Purges specific paths on the AFD endpoint." },
      { text: "az storage blob delete", isCorrect: false, rationale: "Deletes origin, doesn't purge cache." },
      { text: "Restart the Front Door profile", isCorrect: false, rationale: "Not a supported operation and wouldn't purge." },
      { text: "Set Cache-Control: no-store globally", isCorrect: false, rationale: "Disables caching entirely; not a purge." },
    ],
    explanation:
      "Purge an Azure Front Door Standard/Premium endpoint cache via 'az afd endpoint purge --resource-group ... --profile-name ... --endpoint-name ... --content-paths /path1 /path2'. You can pass exact paths or wildcards. Purge propagation typically completes in a few minutes. For long-term cache control, use route caching rules and Cache-Control headers from origin.",
    reference: "https://learn.microsoft.com/azure/frontdoor/front-door-caching-purge",
    tags: ["front-door", "cache", "purge"],
  },
  {
    externalId: "monitor-035",
    domain: "monitor",
    topic: "Application Insights",
    difficulty: "medium",
    type: "single",
    prompt:
      "You want to detect failed authentication spikes in your app and trigger an alert. Which Azure Monitor primitive should you use?",
    options: [
      { text: "Log search alert on Application Insights traces", isCorrect: true, rationale: "Run a KQL query on a schedule and alert if results threshold." },
      { text: "Activity log alert", isCorrect: false, rationale: "Activity log is control-plane only." },
      { text: "Service Health alert", isCorrect: false, rationale: "Azure-side issues; not your app metrics." },
      { text: "Cost alert", isCorrect: false, rationale: "Wrong primitive." },
    ],
    explanation:
      "Azure Monitor supports several alert types: metric alerts (on platform metrics, near real-time), log search alerts (KQL-based, slightly delayed but flexible), activity log alerts (control-plane events), and service health alerts (Azure incidents). For an app-defined event like 'failed auth count > N in last 5 minutes', use a log search alert running a KQL query like requests | where success == false and url contains 'auth' | summarize count() | where count_ > N.",
    reference: "https://learn.microsoft.com/azure/azure-monitor/alerts/alerts-types",
    tags: ["alerts", "monitoring"],
  },
];
