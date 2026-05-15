import type { SeedQuestion } from "./types";

export const computeQuestions: SeedQuestion[] = [
  // ---------- Azure App Service ----------
  {
    externalId: "compute-001",
    domain: "compute",
    topic: "App Service",
    difficulty: "easy",
    type: "single",
    prompt:
      "Your team deploys a web app to Azure App Service. You need to test a new release without affecting production users, then swap it with zero downtime if it passes validation. Which App Service feature should you use?",
    options: [
      { text: "Deployment slots", isCorrect: true, rationale: "Slots host alternate deployments and support warm swap with traffic routing." },
      { text: "Run From Package", isCorrect: false, rationale: "Run From Package controls how the app binary is mounted, not zero-downtime swaps." },
      { text: "Azure Front Door", isCorrect: false, rationale: "Front Door is a global L7 load balancer; it can route traffic but does not provide App Service slot swap semantics." },
      { text: "Application Gateway with WAF", isCorrect: false, rationale: "App Gateway sits in front of apps but does not perform App Service slot swap." },
    ],
    explanation:
      "Deployment slots are live App Service instances that share the same plan. You deploy to a 'staging' slot, validate it (configuration is warmed up), then perform a swap. Slot swaps are designed for zero downtime — App Service swaps the running workers' hostnames after they pass warm-up rules, so users never hit a cold instance.",
    reference: "https://learn.microsoft.com/azure/app-service/deploy-staging-slots",
    tags: ["app-service", "slots", "deployment"],
  },
  {
    externalId: "compute-002",
    domain: "compute",
    topic: "App Service",
    difficulty: "medium",
    type: "multi",
    prompt:
      "When you perform a slot swap from 'staging' to 'production' in App Service, which settings stay with the slot (do NOT swap)? Select all that apply.",
    options: [
      { text: "Publishing endpoints", isCorrect: true, rationale: "SCM/Kudu endpoints are slot-specific." },
      { text: "Custom domain names", isCorrect: true, rationale: "Custom domains are bound to a specific slot." },
      { text: "Non-public certificates and TLS/SSL settings", isCorrect: true, rationale: "Certs and TLS bindings are slot-specific." },
      { text: "Connection strings (unless marked as slot setting)", isCorrect: false, rationale: "Connection strings DO swap unless you tick 'deployment slot setting'." },
      { text: "Scale settings", isCorrect: true, rationale: "Scale config is per slot." },
      { text: "App settings marked as 'deployment slot setting'", isCorrect: true, rationale: "Slot-marked settings are pinned to a slot and do not swap." },
    ],
    explanation:
      "App Service distinguishes between content/configuration that swaps and slot-specific settings that stay put. Settings that do NOT swap include publishing endpoints, custom domains, private certificates and TLS bindings, scale settings, WebJob schedulers, IP restrictions, Always On, and any app setting / connection string explicitly marked as a 'deployment slot setting'. Everything else (general app settings, connection strings without the slot mark, framework versions, handler mappings, monitoring, WebJob content) swaps with the slot.",
    reference: "https://learn.microsoft.com/azure/app-service/deploy-staging-slots#which-settings-are-swapped",
    tags: ["app-service", "slots", "configuration"],
  },
  {
    externalId: "compute-003",
    domain: "compute",
    topic: "App Service",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your App Service Plan must run a Linux container, support VNet integration, and provide auto-scale. Which tier is the minimum that meets all three?",
    options: [
      { text: "Free (F1)", isCorrect: false, rationale: "No custom containers, no VNet integration, no autoscale." },
      { text: "Basic (B1)", isCorrect: false, rationale: "Supports custom containers but lacks VNet integration and autoscale." },
      { text: "Standard (S1)", isCorrect: true, rationale: "First tier supporting VNet integration AND autoscale on Linux." },
      { text: "Isolated v2 (I1v2)", isCorrect: false, rationale: "Meets requirements but is not the minimum." },
    ],
    explanation:
      "Linux custom containers are supported from Basic. However, VNet integration and autoscale require Standard or higher. So Standard (S1) is the minimum tier that meets all three constraints. Premium adds more capacity / faster CPUs / better networking, and Isolated v2 adds App Service Environment.",
    reference: "https://learn.microsoft.com/azure/app-service/overview-hosting-plans",
    tags: ["app-service", "pricing-tiers", "vnet"],
  },
  {
    externalId: "compute-004",
    domain: "compute",
    topic: "App Service",
    difficulty: "medium",
    type: "single",
    prompt:
      "You need to inject configuration into a containerized App Service at startup. Which environment variable lets you mount an Azure Storage share into the container's filesystem?",
    options: [
      { text: "WEBSITES_ENABLE_APP_SERVICE_STORAGE", isCorrect: false, rationale: "Controls persistence of /home — not for mounting external shares." },
      { text: "WEBSITE_RUN_FROM_PACKAGE", isCorrect: false, rationale: "Runs the site from a zip package, unrelated to share mounts." },
      { text: "Custom mount via 'az webapp config storage-account add'", isCorrect: true, rationale: "The proper way to mount Azure Files into the container." },
      { text: "WEBSITES_CONTAINER_START_TIME_LIMIT", isCorrect: false, rationale: "Controls container startup timeout, not mounts." },
    ],
    explanation:
      "For Linux containers on App Service, mount external storage via the 'storage account add' subcommand, which creates a mount of an Azure Files share (or blob via NFS) at a specified path. You can also set this via the portal under Configuration > Path mappings. The setting persists across container restarts so your container can read/write to durable shared storage.",
    reference: "https://learn.microsoft.com/azure/app-service/configure-connect-to-azure-storage",
    tags: ["app-service", "containers", "storage"],
  },
  {
    externalId: "compute-005",
    domain: "compute",
    topic: "App Service",
    difficulty: "hard",
    type: "single",
    prompt:
      "An App Service web app uses Always On but you observe cold starts after every config change. What is the most likely cause and the right fix?",
    options: [
      { text: "Always On is not really enabled; toggle it off and on", isCorrect: false, rationale: "Toggling does not address the underlying behavior." },
      { text: "Config changes restart the worker; use deployment slots with custom warm-up", isCorrect: true, rationale: "App settings changes recycle the worker; slots + warm-up avoid user-visible cold starts." },
      { text: "Increase the instance count", isCorrect: false, rationale: "Scaling out alone does not prevent recycle on config change." },
      { text: "Switch to Consumption Functions", isCorrect: false, rationale: "Wrong workload model; this is a web app." },
    ],
    explanation:
      "Changing app settings or connection strings recycles the App Service worker — Always On only keeps the worker warm; it doesn't prevent restart-on-change. The standard pattern is to apply changes to a staging slot, let it warm up (you can configure custom warm-up URLs via WEBSITE_SWAP_WARMUP_PING_PATH / applicationInitialization), then swap. This way users hit an already-warmed worker.",
    reference: "https://learn.microsoft.com/azure/app-service/deploy-staging-slots#warm-up-during-swap",
    tags: ["app-service", "slots", "warm-up"],
  },
  {
    externalId: "compute-006",
    domain: "compute",
    topic: "App Service",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which environment variable is the recommended way to access app settings from .NET 8 code running in App Service?",
    options: [
      { text: "System.Environment.GetEnvironmentVariable", isCorrect: false, rationale: "Works, but bypasses the configuration system." },
      { text: "IConfiguration injected via DI", isCorrect: true, rationale: "App settings are exposed as configuration entries automatically." },
      { text: "Read from web.config", isCorrect: false, rationale: "Not the modern .NET hosting model on App Service." },
      { text: "Local appsettings.json only", isCorrect: false, rationale: "Local settings are not the runtime source on App Service." },
    ],
    explanation:
      "App Service surfaces app settings as environment variables prefixed with APPSETTING_ and as connection strings prefixed by SQLAZURECONNSTR_, CUSTOMCONNSTR_, etc. The .NET configuration system reads these automatically when you call AddEnvironmentVariables() (default in CreateBuilder), so injecting IConfiguration is idiomatic and testable.",
    reference: "https://learn.microsoft.com/azure/app-service/configure-common",
    tags: ["app-service", "configuration", "dotnet"],
  },

  // ---------- Azure Functions ----------
  {
    externalId: "compute-010",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Azure Functions hosting plan provides true serverless billing where you pay only per execution and GB-seconds?",
    options: [
      { text: "Consumption plan", isCorrect: true, rationale: "Pure pay-per-execution and memory-time." },
      { text: "Premium plan", isCorrect: false, rationale: "Premium has reserved pre-warmed instances and minimum monthly billing." },
      { text: "Dedicated (App Service) plan", isCorrect: false, rationale: "Dedicated bills for the plan whether or not functions run." },
      { text: "Flex Consumption + always ready", isCorrect: false, rationale: "Always-ready instances are billed continuously." },
    ],
    explanation:
      "Consumption is the original serverless plan: idle apps cost nothing, billing is per-execution and per GB-second of memory used. Premium adds pre-warmed workers, VNet integration, and longer runtimes — but with a minimum monthly cost. Flex Consumption is a newer serverless plan with per-instance memory choice and optional always-ready instances; those always-ready instances ARE billed continuously.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-scale",
    tags: ["functions", "hosting-plans", "billing"],
  },
  {
    externalId: "compute-011",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which scenarios REQUIRE the Premium or Dedicated plan rather than Consumption? Select all that apply.",
    options: [
      { text: "Function execution must regularly exceed 10 minutes", isCorrect: true, rationale: "Consumption max execution = 10 minutes (5 default). Premium = unbounded." },
      { text: "You need virtual network integration", isCorrect: true, rationale: "VNet integration requires Premium, Dedicated, or Flex Consumption." },
      { text: "You need to avoid cold starts deterministically", isCorrect: true, rationale: "Premium offers pre-warmed instances; Consumption can cold start." },
      { text: "You need bindings to Cosmos DB", isCorrect: false, rationale: "Bindings work in any plan." },
      { text: "Your app must scale to zero when idle", isCorrect: false, rationale: "Scale-to-zero is a Consumption advantage." },
    ],
    explanation:
      "Premium adds three core benefits: longer execution (no 10-minute cap), VNet integration, and pre-warmed always-ready instances to avoid cold starts. Dedicated (App Service Plan) is useful when you want to reuse an existing plan or when you need OS-level access. Cosmos DB bindings, Event Grid triggers, and other bindings all work on any plan. Scale-to-zero only applies to Consumption.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-premium-plan",
    tags: ["functions", "premium", "vnet", "cold-start"],
  },
  {
    externalId: "compute-012",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "medium",
    type: "single",
    prompt:
      "You're writing a C# isolated-worker Azure Function triggered by a new blob. Which attribute on the parameter correctly binds the function to a Blob trigger?",
    code: "[Function(\"ProcessBlob\")]\npublic async Task Run(\n    [_____(\"uploads/{name}\", Connection = \"StorageConnection\")] Stream blob,\n    string name,\n    FunctionContext context)\n{\n    // ...\n}",
    codeLanguage: "csharp",
    options: [
      { text: "BlobTrigger", isCorrect: true, rationale: "Correct attribute name for blob trigger in isolated worker." },
      { text: "BlobInput", isCorrect: false, rationale: "Not a valid attribute." },
      { text: "QueueTrigger", isCorrect: false, rationale: "Different binding." },
      { text: "EventGridTrigger", isCorrect: false, rationale: "Different binding, though preferred for high-volume blob events." },
    ],
    explanation:
      "BlobTrigger watches a container path pattern and invokes the function for each new/updated blob. Note that for high-volume scenarios, Microsoft recommends using Event Grid blob events with EventGridTrigger instead of BlobTrigger — Event Grid pushes events reliably and at low latency, whereas BlobTrigger uses a polling / queue scan model that may have minutes of delay on large containers.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-bindings-storage-blob-trigger",
    tags: ["functions", "bindings", "blob", "csharp"],
  },
  {
    externalId: "compute-013",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "hard",
    type: "single",
    prompt:
      "Your Function App on the Consumption plan must coordinate a multi-step approval workflow that waits for human input for hours or days. Which programming model fits best?",
    options: [
      { text: "Regular HTTP-triggered functions polled by the client", isCorrect: false, rationale: "Possible but loses state and idempotency." },
      { text: "Durable Functions orchestrator with WaitForExternalEvent", isCorrect: true, rationale: "Designed for long-running, stateful workflows with human-in-the-loop." },
      { text: "Service Bus sessions", isCorrect: false, rationale: "Useful for ordered messaging but not an orchestration model." },
      { text: "Logic Apps only", isCorrect: false, rationale: "Logic Apps is an alternative, but the question asks within Functions." },
    ],
    explanation:
      "Durable Functions extends Azure Functions with stateful orchestrations. Orchestrator functions can WaitForExternalEvent for arbitrarily long periods (state is checkpointed to storage), can fan out / fan in, support timers and human interaction patterns, and survive worker recycles. This is the canonical pattern for long-running approval and human-in-the-loop workflows on Consumption.",
    reference: "https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview",
    tags: ["functions", "durable", "orchestration"],
  },
  {
    externalId: "compute-014",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "medium",
    type: "single",
    prompt:
      "What is the recommended way to expose secrets such as a Cosmos DB key to your Function App without storing the value in app settings?",
    options: [
      { text: "Use a Key Vault reference: @Microsoft.KeyVault(SecretUri=...)", isCorrect: true, rationale: "Key Vault references resolve at runtime via managed identity." },
      { text: "Put it in a local.settings.json and deploy it", isCorrect: false, rationale: "local.settings.json is not deployed to Azure." },
      { text: "Hardcode it in the function source", isCorrect: false, rationale: "Never do this." },
      { text: "Pass it as a query string parameter from the client", isCorrect: false, rationale: "Exposes the secret." },
    ],
    explanation:
      "Configure the Function App with a system- or user-assigned managed identity, grant it 'get' on the Key Vault secret, then set the app setting value to '@Microsoft.KeyVault(SecretUri=https://<vault>.vault.azure.net/secrets/<name>/<version>)'. App Service / Functions resolves the reference at startup and on a periodic refresh. Code reads the resolved value via IConfiguration as if it were a plain setting.",
    reference: "https://learn.microsoft.com/azure/app-service/app-service-key-vault-references",
    tags: ["functions", "key-vault", "secrets", "managed-identity"],
  },
  {
    externalId: "compute-015",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which trigger should you use for a function that runs every weekday at 06:00 UTC?",
    options: [
      { text: "TimerTrigger with NCRONTAB '0 0 6 * * 1-5'", isCorrect: true, rationale: "NCRONTAB 6-field expression: sec min hour day month day-of-week." },
      { text: "TimerTrigger with cron '0 6 * * 1-5'", isCorrect: false, rationale: "Standard 5-field cron isn't the NCRONTAB format Functions uses." },
      { text: "EventGridTrigger", isCorrect: false, rationale: "No scheduled source." },
      { text: "HttpTrigger called by external scheduler", isCorrect: false, rationale: "Works but isn't the idiomatic answer." },
    ],
    explanation:
      "Azure Functions uses NCRONTAB expressions with six fields (seconds, minutes, hours, day-of-month, month, day-of-week). '0 0 6 * * 1-5' fires at 06:00:00 on Monday through Friday. By default the schedule uses UTC; set WEBSITE_TIME_ZONE to change.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-bindings-timer",
    tags: ["functions", "timer", "ncrontab"],
  },
  {
    externalId: "compute-016",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "medium",
    type: "single",
    prompt:
      "You have a CPU-intensive function that processes images. On the Consumption plan, executions get throttled and you see significant cold-start latency. Which configuration change has the LARGEST impact?",
    options: [
      { text: "Move to the Premium plan with always-ready instances", isCorrect: true, rationale: "Eliminates cold start and removes 1.5GB memory ceiling." },
      { text: "Increase FUNCTIONS_WORKER_PROCESS_COUNT", isCorrect: false, rationale: "Helps for IO-bound work; CPU-bound work won't benefit much." },
      { text: "Switch trigger from HTTP to Queue", isCorrect: false, rationale: "Doesn't change resource limits." },
      { text: "Enable WEBSITE_RUN_FROM_PACKAGE", isCorrect: false, rationale: "Improves deploy times, not runtime CPU." },
    ],
    explanation:
      "Consumption plan instances are 1.5 GB memory / 1 vCPU and there's a per-instance concurrency limit; CPU-bound workloads also pay full cold-start cost. Premium offers larger SKUs (EP1/EP2/EP3 — up to 14 GB / 4 vCPU) and always-ready instances that eliminate cold start. For media processing, Premium (or Container Apps / AKS) is generally a better fit than Consumption.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-premium-plan",
    tags: ["functions", "performance", "premium"],
  },
  {
    externalId: "compute-017",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "hard",
    type: "single",
    prompt:
      "A Service Bus-triggered function uses session-enabled queues and must process messages of the same session in order, one at a time. Which host.json setting must be configured?",
    options: [
      { text: "extensions.serviceBus.sessionHandlerOptions.maxConcurrentSessions = 1 alone is enough", isCorrect: false, rationale: "Concurrency within a session is still controlled separately." },
      { text: "isSessionsEnabled = true on the trigger, plus maxConcurrentCallsPerSession = 1", isCorrect: true, rationale: "Both are required: declare session mode and limit per-session concurrency to preserve order." },
      { text: "prefetchCount = 0", isCorrect: false, rationale: "Prefetch tunes throughput, not ordering." },
      { text: "autoCompleteMessages = false", isCorrect: false, rationale: "Controls completion semantics, not order." },
    ],
    explanation:
      "Service Bus sessions group messages by SessionId. To preserve order within a session, set isSessionsEnabled = true on the trigger and configure sessionHandlerOptions.maxConcurrentCallsPerSession = 1 (default is 1 already, but be explicit). You can still process many sessions in parallel by tuning maxConcurrentSessions. Functions checks out the session lock and processes messages serially within it.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-bindings-service-bus-trigger",
    tags: ["functions", "service-bus", "sessions", "ordering"],
  },

  // ---------- Containers / ACR / ACI ----------
  {
    externalId: "compute-020",
    domain: "compute",
    topic: "Containers",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Azure CLI command builds a container image directly in Azure Container Registry without requiring a local Docker daemon?",
    options: [
      { text: "az acr build", isCorrect: true, rationale: "Server-side build using ACR Tasks." },
      { text: "az acr import", isCorrect: false, rationale: "Imports an existing image from another registry." },
      { text: "az acr login + docker build + docker push", isCorrect: false, rationale: "This requires a local Docker engine." },
      { text: "az container create", isCorrect: false, rationale: "Creates an ACI container instance, not a build." },
    ],
    explanation:
      "az acr build uses ACR Tasks to perform the build on Azure infrastructure from your local source (or a remote git URL). The resulting image is pushed to the registry. This is useful in CI agents that don't have Docker, in dev containers, or to keep large source contexts off your workstation.",
    reference: "https://learn.microsoft.com/azure/container-registry/container-registry-quickstart-task-cli",
    tags: ["acr", "containers", "build"],
  },
  {
    externalId: "compute-021",
    domain: "compute",
    topic: "Containers",
    difficulty: "medium",
    type: "single",
    prompt:
      "You need an ACR Task that automatically rebuilds and pushes an image whenever the base image is updated upstream. Which trigger should you configure?",
    options: [
      { text: "Source code commit trigger", isCorrect: false, rationale: "Fires on git commits, not base image updates." },
      { text: "Base image update trigger", isCorrect: true, rationale: "Detects upstream base image changes and rebuilds." },
      { text: "Manual run only", isCorrect: false, rationale: "Doesn't fit the 'automatic' requirement." },
      { text: "Webhook from Docker Hub", isCorrect: false, rationale: "Possible but not the ACR Task primitive being asked about." },
    ],
    explanation:
      "ACR Tasks supports three triggers: source code commit (GitHub/Azure DevOps), base image update (you tag a base image and ACR rebuilds when that base changes), and timer (cron). Base image update triggers are critical for keeping derived images patched with the latest OS / runtime fixes.",
    reference: "https://learn.microsoft.com/azure/container-registry/container-registry-tasks-overview",
    tags: ["acr", "tasks", "base-image"],
  },
  {
    externalId: "compute-022",
    domain: "compute",
    topic: "Container Apps",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which statements about Azure Container Apps scaling are TRUE? Select all that apply.",
    options: [
      { text: "Scaling rules are KEDA-based and support HTTP, CPU, memory, and custom event sources", isCorrect: true, rationale: "Container Apps uses KEDA scalers." },
      { text: "Apps can scale to zero", isCorrect: true, rationale: "Yes — only HTTP-triggered apps stay 'warm' if minReplicas=1." },
      { text: "Scaling rules are evaluated by the KEDA agent every poll interval", isCorrect: true, rationale: "Standard KEDA behavior." },
      { text: "You must run Kubernetes to manage scaling", isCorrect: false, rationale: "Container Apps abstracts Kubernetes — you do not manage the cluster." },
      { text: "Service Bus queue length is a valid scale source", isCorrect: true, rationale: "KEDA has a Service Bus scaler." },
    ],
    explanation:
      "Container Apps runs on managed Kubernetes underneath but you only deal with the app primitive. Scaling uses KEDA, which polls a wide range of event sources (queues, topics, Cosmos, Kafka, custom metrics, CPU, memory, HTTP). minReplicas can be 0 — perfect for spiky event-driven workloads — and KEDA wakes up replicas in response to events.",
    reference: "https://learn.microsoft.com/azure/container-apps/scale-app",
    tags: ["container-apps", "keda", "scaling"],
  },
  {
    externalId: "compute-023",
    domain: "compute",
    topic: "Container Apps",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your Container App has two revisions: rev-A (80% traffic) and rev-B (20% traffic). You want to phase rev-B to 100%. Which mode and command path is correct?",
    options: [
      { text: "Set revisionsMode=single, deploy a new revision, traffic auto-shifts", isCorrect: false, rationale: "Single mode replaces traffic entirely on activation; you cannot split." },
      { text: "Set revisionsMode=multiple, then 'az containerapp ingress traffic set' with weights", isCorrect: true, rationale: "Multiple revisions enable traffic splitting." },
      { text: "Use Front Door to split traffic between two Container Apps", isCorrect: false, rationale: "Works but is unnecessary — Container Apps natively supports this." },
      { text: "Use App Service slots", isCorrect: false, rationale: "Slots are an App Service feature, not Container Apps." },
    ],
    explanation:
      "Container Apps supports two revision modes. In single mode, the latest active revision receives 100% of traffic. In multiple mode, several revisions can be active simultaneously with explicit traffic weights — perfect for canary, blue/green, or A/B rollouts. Use 'az containerapp ingress traffic set --revision-weight rev-A=0 rev-B=100' to cut over once rev-B is validated.",
    reference: "https://learn.microsoft.com/azure/container-apps/revisions",
    tags: ["container-apps", "revisions", "canary"],
  },
  {
    externalId: "compute-024",
    domain: "compute",
    topic: "Container Apps",
    difficulty: "hard",
    type: "single",
    prompt:
      "Two services in the same Container Apps environment must communicate over service discovery without exposing public endpoints. What is the minimum configuration?",
    options: [
      { text: "Enable Dapr on both services and use service-to-service invocation", isCorrect: false, rationale: "Works but is more than the minimum." },
      { text: "Set ingress.external=false; use 'https://<app-name>' for internal calls", isCorrect: true, rationale: "Internal ingress gives the app a cluster-local DNS name." },
      { text: "Place them behind Application Gateway", isCorrect: false, rationale: "Adds a public surface and unnecessary cost." },
      { text: "Use Private Link with separate environments", isCorrect: false, rationale: "Same environment doesn't need Private Link." },
    ],
    explanation:
      "Apps in the same environment share a private network. Setting ingress.external=false makes the app reachable only inside the environment via the internal FQDN 'https://<app-name>.internal.<env-domain>' (or simply '<app-name>' from another app in the same env). Dapr is great for service invocation, pub/sub, state, etc., but is optional — for pure HTTP service-to-service, internal ingress alone is enough.",
    reference: "https://learn.microsoft.com/azure/container-apps/ingress-overview",
    tags: ["container-apps", "ingress", "networking"],
  },
  {
    externalId: "compute-025",
    domain: "compute",
    topic: "ACI",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which workload is the best fit for Azure Container Instances (ACI) rather than Container Apps or AKS?",
    options: [
      { text: "A microservice with autoscale, ingress, and revision history", isCorrect: false, rationale: "Better suited to Container Apps." },
      { text: "A short-lived batch job that just needs a container to run on demand", isCorrect: true, rationale: "ACI excels at single-shot tasks: simple, per-second billing, no cluster." },
      { text: "A fleet of stateful services with complex networking policies", isCorrect: false, rationale: "AKS is the right tool." },
      { text: "An event-driven function with multiple bindings", isCorrect: false, rationale: "Azure Functions fits better." },
    ],
    explanation:
      "ACI is the simplest container hosting option: spin up a single container or container group, pay per-second, no cluster management. It's ideal for batch jobs, build agents, occasional tasks, or as a 'burst out' target from AKS via virtual nodes. Anything that needs ingress, autoscale, revisions, or complex networking is better on Container Apps (managed) or AKS (full Kubernetes).",
    reference: "https://learn.microsoft.com/azure/container-instances/container-instances-overview",
    tags: ["aci", "containers"],
  },
  {
    externalId: "compute-026",
    domain: "compute",
    topic: "Containers",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which command pulls an image from ACR using your Microsoft Entra identity instead of an admin user account?",
    options: [
      { text: "az acr login --name <registry>", isCorrect: true, rationale: "Uses Entra token; admin user is not required." },
      { text: "docker login <registry>.azurecr.io -u <admin> -p <password>", isCorrect: false, rationale: "Uses the admin account; an antipattern." },
      { text: "az acr token create + docker login", isCorrect: false, rationale: "Token-based but distinct from Entra-based login." },
      { text: "az login then docker pull", isCorrect: false, rationale: "az login alone doesn't authenticate Docker to ACR." },
    ],
    explanation:
      "'az acr login' obtains an Entra access token, exchanges it with ACR for a Docker refresh token, and writes Docker credentials. This avoids enabling the registry's admin user (which uses a static long-lived password). For unattended scenarios in pipelines or apps, use a managed identity or a service principal with the AcrPull role.",
    reference: "https://learn.microsoft.com/azure/container-registry/container-registry-authentication",
    tags: ["acr", "auth", "identity"],
  },
  {
    externalId: "compute-027",
    domain: "compute",
    topic: "AKS",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your AKS deployment uses kubelet identity to pull images from ACR. After attaching, you still see 'ImagePullBackOff'. What is the most common cause?",
    options: [
      { text: "ACR firewall is blocking the AKS subnet", isCorrect: false, rationale: "Possible but less common than the role assignment timing." },
      { text: "The kubelet identity does not have the AcrPull role yet", isCorrect: true, rationale: "Most common cause; role assignment may have failed or not propagated." },
      { text: "The image tag does not exist in the registry", isCorrect: false, rationale: "Would yield ErrImagePull, not ImagePullBackOff." },
      { text: "AKS uses Docker which is deprecated", isCorrect: false, rationale: "Containerd is now the default but does not cause this." },
    ],
    explanation:
      "'az aks update --attach-acr' grants the AcrPull role to the kubelet identity. If the caller lacks Owner / User Access Administrator on the registry, the role assignment fails silently. Verify with 'az role assignment list --scope <acr-resource-id> --assignee <kubelet-identity-principal-id>'. Alternative: configure an imagePullSecret manually using a service principal or token.",
    reference: "https://learn.microsoft.com/azure/aks/cluster-container-registry-integration",
    tags: ["aks", "acr", "auth"],
  },

  // ---------- Mixed compute ----------
  {
    externalId: "compute-030",
    domain: "compute",
    topic: "App Service",
    difficulty: "hard",
    type: "single",
    prompt:
      "A regulated workload must run in App Service with no shared frontends, full network isolation, and the ability to use private IP addresses. Which option meets the requirements?",
    options: [
      { text: "Standard plan + VNet integration", isCorrect: false, rationale: "Outbound only; ingress is still on shared frontends." },
      { text: "Premium plan + Private Endpoint", isCorrect: false, rationale: "Removes public ingress but app still runs on multi-tenant infra." },
      { text: "App Service Environment v3 (Isolated v2)", isCorrect: true, rationale: "Single-tenant, deployed into your VNet with full isolation." },
      { text: "Functions Premium with VNet integration", isCorrect: false, rationale: "Single-tenant compute requires ASE." },
    ],
    explanation:
      "App Service Environment v3 (ASEv3, billed via Isolated v2 plans) deploys App Service into your own VNet on dedicated single-tenant infrastructure. It supports private ingress, private internal load balancer, and works with NSGs, route tables, and private endpoints. Premium plus Private Endpoint reduces ingress exposure but the underlying compute remains multi-tenant.",
    reference: "https://learn.microsoft.com/azure/app-service/environment/overview",
    tags: ["app-service", "ase", "networking"],
  },
  {
    externalId: "compute-031",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "medium",
    type: "single",
    prompt:
      "You added a Cosmos DB output binding to your function and want it to upsert documents instead of inserting them. Which binding property do you set?",
    options: [
      { text: "createIfNotExists = true", isCorrect: false, rationale: "Controls container creation, not upsert behavior." },
      { text: "Use IAsyncCollector<T> with UpsertAsync semantics from a CosmosClient instead", isCorrect: false, rationale: "Mixes models." },
      { text: "The Cosmos DB output binding always upserts when partition key is set", isCorrect: true, rationale: "Output binding performs an upsert by default." },
      { text: "Add 'upsert: true' to host.json", isCorrect: false, rationale: "No such global setting." },
    ],
    explanation:
      "The Cosmos DB output binding performs an upsert by default — if the document's id and partition key match an existing document, it is replaced; otherwise inserted. For more control (transactional batches, conditional writes), inject a CosmosClient using the SDK directly via dependency injection instead of using the binding.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-bindings-cosmosdb-v2-output",
    tags: ["functions", "cosmos", "bindings"],
  },
  {
    externalId: "compute-032",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which file controls runtime version, extension bundles, logging, and concurrency for a Function App?",
    options: [
      { text: "host.json", isCorrect: true, rationale: "Global host config for all functions in the app." },
      { text: "local.settings.json", isCorrect: false, rationale: "Local-dev-only environment settings; not deployed." },
      { text: "function.json (per function)", isCorrect: false, rationale: "Bindings only, per function." },
      { text: "proxies.json", isCorrect: false, rationale: "Legacy proxies feature, now deprecated." },
    ],
    explanation:
      "host.json is the per-app host config: extensionBundle version, function timeout, logging level, sampling, scale concurrency hints (maxConcurrentRequests for HTTP, batch sizes for queues, etc). local.settings.json holds local env vars and connection strings — NOT deployed. function.json (only in script languages) maps bindings for a specific function.",
    reference: "https://learn.microsoft.com/azure/azure-functions/functions-host-json",
    tags: ["functions", "configuration"],
  },
  {
    externalId: "compute-033",
    domain: "compute",
    topic: "Containers",
    difficulty: "hard",
    type: "single",
    prompt:
      "An ACR Geo-replicated registry has replicas in East US and West Europe. A pull from an AKS cluster in West Europe returns the image from East US. What is the most likely cause?",
    options: [
      { text: "Geo-replication is async and the West Europe replica is not yet seeded with this tag", isCorrect: true, rationale: "Until replication catches up, the closest available replica serves the pull." },
      { text: "ACR routes by alphabetical region name", isCorrect: false, rationale: "False." },
      { text: "The Premium SKU is required for routing", isCorrect: false, rationale: "Geo-replication itself requires Premium and routing IS automatic." },
      { text: "Cross-region pulls are billed extra and Azure prefers home region", isCorrect: false, rationale: "Not how ACR data routing works." },
    ],
    explanation:
      "ACR Premium geo-replication asynchronously replicates manifests and layers between replicas. The login server is anycast: pulls automatically go to the nearest replica that HAS the image. If you push a new tag and immediately pull from another region, you may hit a remote replica until replication completes. For multi-region rollouts, push to all replicas (or wait) before triggering deployments downstream.",
    reference: "https://learn.microsoft.com/azure/container-registry/container-registry-geo-replication",
    tags: ["acr", "geo-replication"],
  },
  {
    externalId: "compute-034",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which authorization level on an HTTP-triggered function requires the caller to supply a function-specific key only?",
    options: [
      { text: "Anonymous", isCorrect: false, rationale: "No key required." },
      { text: "Function", isCorrect: true, rationale: "Function-scoped key required." },
      { text: "Admin", isCorrect: false, rationale: "Requires master key, full host access." },
      { text: "System", isCorrect: false, rationale: "Reserved for system extensions." },
    ],
    explanation:
      "HTTP trigger AuthorizationLevel values: Anonymous (no key), Function (function-scoped key — most common production default), Admin (master/host key — grants admin access to the whole app), System (system keys used by extensions like Event Grid). Pass the key via the x-functions-key header or code= query string.",
    reference: "https://learn.microsoft.com/azure/azure-functions/function-keys-how-to",
    tags: ["functions", "http", "auth"],
  },
  {
    externalId: "compute-035",
    domain: "compute",
    topic: "Azure Functions",
    difficulty: "hard",
    type: "multi",
    prompt:
      "Which Durable Functions orchestration patterns are valid? Select all that apply.",
    options: [
      { text: "Function chaining", isCorrect: true, rationale: "Sequence A → B → C with output of one feeding the next." },
      { text: "Fan-out / fan-in", isCorrect: true, rationale: "Parallel work followed by aggregation." },
      { text: "Async HTTP APIs with status endpoints", isCorrect: true, rationale: "Polling pattern; orchestrator returns a status URL." },
      { text: "Monitor (periodic recurring work with state)", isCorrect: true, rationale: "Eternal orchestration that sleeps and resumes." },
      { text: "Aggregator / Entity functions", isCorrect: true, rationale: "Single-threaded stateful entities." },
      { text: "Human interaction (WaitForExternalEvent)", isCorrect: true, rationale: "Approval-style flows." },
    ],
    explanation:
      "Durable Functions documents six core application patterns: function chaining, fan-out/fan-in, async HTTP APIs, monitor (polling/periodic), human interaction, and aggregator (durable entities). All compile down to the same underlying replay-based orchestration runtime that checkpoints state to durable storage.",
    reference: "https://learn.microsoft.com/azure/azure-functions/durable/durable-functions-overview#application-patterns",
    tags: ["functions", "durable", "patterns"],
  },
  {
    externalId: "compute-036",
    domain: "compute",
    topic: "App Service",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which deployment mechanism produces the FASTEST startup for a .NET App Service and avoids file-locking issues during deploy?",
    options: [
      { text: "FTP", isCorrect: false, rationale: "Slow, can lock files." },
      { text: "Git push to local repo", isCorrect: false, rationale: "Triggers build on Kudu, slower." },
      { text: "Run From Package (WEBSITE_RUN_FROM_PACKAGE=1)", isCorrect: true, rationale: "Mounts the zip read-only; instant atomic deploy." },
      { text: "WebDeploy in place", isCorrect: false, rationale: "Can lock files mid-deploy." },
    ],
    explanation:
      "Setting WEBSITE_RUN_FROM_PACKAGE=1 (or pointing it to a blob URL with SAS) makes App Service mount the deployed zip as the read-only wwwroot. Benefits: atomic swap, no partial file states, no file-in-use errors, faster cold start because the package is already pre-built and the file system doesn't need extraction. It's the recommended mechanism for production.",
    reference: "https://learn.microsoft.com/azure/app-service/deploy-run-package",
    tags: ["app-service", "deploy", "run-from-package"],
  },
  {
    externalId: "compute-037",
    domain: "compute",
    topic: "App Service",
    difficulty: "easy",
    type: "single",
    prompt:
      "You need to debug an outgoing connection from a Linux App Service. Which built-in tool reachable in the Kudu SSH console can verify DNS and TCP reachability?",
    options: [
      { text: "tcpping <host>:<port>", isCorrect: true, rationale: "Built into App Service Kudu for connectivity testing." },
      { text: "telnet <host> <port>", isCorrect: false, rationale: "Not installed by default." },
      { text: "ping <host>", isCorrect: false, rationale: "ICMP is blocked in App Service." },
      { text: "traceroute <host>", isCorrect: false, rationale: "Not available." },
    ],
    explanation:
      "ICMP is blocked in App Service, so ping/traceroute won't work. App Service ships 'tcpping' (and 'nameresolver' for DNS) in the Kudu console — use them to verify TCP reachability and DNS resolution from inside the app's network context (especially important with VNet integration and Private Endpoints).",
    reference: "https://learn.microsoft.com/azure/app-service/configure-vnet-integration-enable",
    tags: ["app-service", "diagnostics", "networking"],
  },
  {
    externalId: "compute-038",
    domain: "compute",
    topic: "Container Apps",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which authentication method should a Container App use to pull a private image from an Azure Container Registry without storing credentials in the app definition?",
    options: [
      { text: "Username + password app secret", isCorrect: false, rationale: "Stores credentials; antipattern." },
      { text: "System-assigned managed identity with AcrPull role", isCorrect: true, rationale: "Credential-free, role-based pull." },
      { text: "Public image only", isCorrect: false, rationale: "Defeats the requirement." },
      { text: "Service principal saved in Key Vault", isCorrect: false, rationale: "Possible but still requires credential management." },
    ],
    explanation:
      "Container Apps supports managed identity for ACR pulls. Enable a system- or user-assigned identity, assign it the AcrPull role on the registry, then configure the registry block in the app definition with 'identity: system' (or the user identity resource ID). No secrets stored anywhere.",
    reference: "https://learn.microsoft.com/azure/container-apps/managed-identity-image-pull",
    tags: ["container-apps", "acr", "managed-identity"],
  },
];
