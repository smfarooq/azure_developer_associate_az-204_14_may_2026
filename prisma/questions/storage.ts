import type { SeedQuestion } from "./types";

export const storageQuestions: SeedQuestion[] = [
  // ---------- Blob Storage ----------
  {
    externalId: "storage-001",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Azure Blob access tier offers the LOWEST storage cost but the HIGHEST retrieval cost and latency, and is intended for data that will be rarely accessed and stored for at least 180 days?",
    options: [
      { text: "Hot", isCorrect: false, rationale: "Highest storage cost, lowest access cost — for frequently accessed data." },
      { text: "Cool", isCorrect: false, rationale: "30+ days, lower than Hot, but not the lowest." },
      { text: "Cold", isCorrect: false, rationale: "90+ days, between Cool and Archive." },
      { text: "Archive", isCorrect: true, rationale: "Lowest storage cost; offline; hours to rehydrate; 180-day commitment." },
    ],
    explanation:
      "Blob tiers from highest to lowest storage cost: Hot → Cool (30+ days minimum) → Cold (90+ days) → Archive (180+ days). Archive is OFFLINE — to read data you must rehydrate to Hot/Cool, which can take hours (standard) or about an hour (high priority). Early deletion fees apply if you delete before the minimum retention.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/access-tiers-overview",
    tags: ["blob", "tiers"],
  },
  {
    externalId: "storage-002",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "medium",
    type: "single",
    prompt:
      "You need to generate a time-limited URL that lets a third party UPLOAD a blob to a specific container without exposing your account key. Which mechanism should you use?",
    options: [
      { text: "Account-level SAS with write permission", isCorrect: false, rationale: "Works, but is over-scoped — grants account-wide." },
      { text: "User-delegation SAS with write permission scoped to the container", isCorrect: true, rationale: "Signed with Entra credentials, scoped, no key exposure." },
      { text: "Service SAS signed with the account key with write permission", isCorrect: false, rationale: "Works but relies on the account key — less secure." },
      { text: "Shared access policy with read permission", isCorrect: false, rationale: "Wrong permission and not a complete answer." },
    ],
    explanation:
      "A user-delegation SAS is signed with a Microsoft Entra ID OAuth credential rather than the account key. It is the recommended SAS form because (a) no shared key is exposed, (b) it can be quickly revoked by rotating the user-delegation key, and (c) RBAC is enforced when issuing the SAS. Scope it to the container with 'w' (write/create) permission for upload only.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/storage-blob-user-delegation-sas-create-cli",
    tags: ["blob", "sas", "user-delegation"],
  },
  {
    externalId: "storage-003",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which features REQUIRE enabling hierarchical namespace (Azure Data Lake Storage Gen2) on the storage account? Select all that apply.",
    options: [
      { text: "POSIX-style ACLs on directories and files", isCorrect: true, rationale: "ADLS Gen2 feature." },
      { text: "Atomic directory rename and delete", isCorrect: true, rationale: "Requires HNS." },
      { text: "Lifecycle management for blobs", isCorrect: false, rationale: "Works without HNS." },
      { text: "abfss:// driver for Spark and Hadoop", isCorrect: true, rationale: "ABFS driver targets HNS endpoint." },
      { text: "Soft delete for blobs", isCorrect: false, rationale: "Works on any blob storage." },
    ],
    explanation:
      "Hierarchical namespace turns the flat blob namespace into a true filesystem with directories. Benefits exclusive to HNS: POSIX ACLs (per-file/dir, in addition to RBAC), atomic dir operations, and the abfss driver used by big-data engines. Soft delete, versioning, change feed, and lifecycle policies work on either flat or HNS accounts.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/data-lake-storage-namespace",
    tags: ["blob", "adls-gen2", "hns"],
  },
  {
    externalId: "storage-004",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which .NET client class is recommended for blob operations in modern code?",
    options: [
      { text: "Microsoft.WindowsAzure.Storage.Blob.CloudBlobClient", isCorrect: false, rationale: "Legacy v11 SDK — deprecated." },
      { text: "Microsoft.Azure.Storage.Blob.CloudBlobClient", isCorrect: false, rationale: "Track 1 SDK, still legacy." },
      { text: "Azure.Storage.Blobs.BlobServiceClient", isCorrect: true, rationale: "Modern Azure.* SDK; Entra-friendly." },
      { text: "Microsoft.Azure.WebJobs.BlobAttribute", isCorrect: false, rationale: "Functions binding attribute, not a general SDK." },
    ],
    explanation:
      "The current Azure SDK family lives under the Azure.* namespace. For blobs: Azure.Storage.Blobs (BlobServiceClient → BlobContainerClient → BlobClient). It supports Microsoft Entra credentials via Azure.Identity (DefaultAzureCredential), modern async patterns, and built-in retry policies. The older Microsoft.WindowsAzure.Storage / Microsoft.Azure.Storage packages are deprecated.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/storage-blob-dotnet-get-started",
    tags: ["blob", "dotnet", "sdk"],
  },
  {
    externalId: "storage-005",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "medium",
    type: "single",
    prompt:
      "You enable lifecycle management. Which rule action moves a blob to the Archive tier 180 days after last modification?",
    code: "{\n  \"rules\": [{\n    \"name\": \"archive-old\",\n    \"enabled\": true,\n    \"type\": \"Lifecycle\",\n    \"definition\": {\n      \"filters\": { \"blobTypes\": [\"blockBlob\"] },\n      \"actions\": { \"baseBlob\": { \"_____\": { \"daysAfterModificationGreaterThan\": 180 } } }\n    }\n  }]\n}",
    codeLanguage: "json",
    options: [
      { text: "tierToCool", isCorrect: false, rationale: "Moves to Cool tier." },
      { text: "tierToCold", isCorrect: false, rationale: "Moves to Cold tier." },
      { text: "tierToArchive", isCorrect: true, rationale: "Moves to Archive tier." },
      { text: "delete", isCorrect: false, rationale: "Deletes the blob — not asked." },
    ],
    explanation:
      "Lifecycle management actions on baseBlob include tierToCool, tierToCold, tierToArchive, enableAutoTierToHotFromCool, and delete. Each takes daysAfterModificationGreaterThan, daysAfterLastAccessTimeGreaterThan (requires last-access tracking), or daysAfterCreationGreaterThan. You can also target snapshots and versions with separate sections.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/lifecycle-management-overview",
    tags: ["blob", "lifecycle", "json"],
  },
  {
    externalId: "storage-006",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "hard",
    type: "single",
    prompt:
      "A blob upload is failing with HTTP 412 Precondition Failed. Your code sets the If-None-Match header to '*'. What does this signal?",
    options: [
      { text: "The blob is leased and cannot be written", isCorrect: false, rationale: "Would return 409." },
      { text: "A blob with that name already exists; the upload was rejected to prevent overwrite", isCorrect: true, rationale: "If-None-Match: * means 'only create if it does NOT exist'." },
      { text: "The client clock is skewed", isCorrect: false, rationale: "Would yield a different error." },
      { text: "The SAS token has expired", isCorrect: false, rationale: "Yields 403, not 412." },
    ],
    explanation:
      "If-None-Match: * is the standard HTTP precondition that means 'only succeed if no entity exists' — i.e., 'create if absent'. Azure Blob storage returns 412 Precondition Failed when the blob already exists. This is the right way to implement optimistic 'create or fail' semantics without a race condition. To overwrite, omit the header or use specific ETag matching.",
    reference: "https://learn.microsoft.com/rest/api/storageservices/specifying-conditional-headers-for-blob-service-operations",
    tags: ["blob", "concurrency", "http"],
  },
  {
    externalId: "storage-007",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which combination correctly implements optimistic concurrency on blob METADATA updates?",
    options: [
      { text: "Read blob, capture ETag, write with If-Match: <etag>; handle 412 by retrying", isCorrect: true, rationale: "Classic ETag-based optimistic concurrency." },
      { text: "Acquire a lease before reading, release after writing", isCorrect: false, rationale: "Pessimistic, blocks other writers." },
      { text: "Use If-None-Match: * on the update", isCorrect: false, rationale: "Wrong precondition; treats update like create." },
      { text: "Compare blob length before writing", isCorrect: false, rationale: "Length is not a reliable concurrency token." },
    ],
    explanation:
      "Optimistic concurrency: read returns an ETag in the response. When you update, send If-Match: <etag>. If the blob has changed since your read, the server returns 412 Precondition Failed and you retry from step one. Leases work too but are pessimistic (block other writers until release) and add operational overhead.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/concurrency-manage",
    tags: ["blob", "concurrency", "etag"],
  },
  {
    externalId: "storage-008",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "medium",
    type: "single",
    prompt:
      "You need to ensure deleted blobs can be restored for up to 30 days. Which feature do you enable?",
    options: [
      { text: "Soft delete for blobs", isCorrect: true, rationale: "Provides a recovery window up to 365 days." },
      { text: "Blob versioning", isCorrect: false, rationale: "Useful but does not by itself protect against delete." },
      { text: "Point-in-time restore", isCorrect: false, rationale: "Higher-level feature requiring soft delete + versioning + change feed." },
      { text: "Immutable WORM policy", isCorrect: false, rationale: "Prevents delete entirely — different requirement." },
    ],
    explanation:
      "Enable 'soft delete for blobs' with the desired retention (1–365 days). Deleted blobs are kept in a recoverable state and can be undeleted via the SDK or portal. For full point-in-time restore of an entire container, you need soft delete + versioning + change feed enabled together.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/soft-delete-blob-overview",
    tags: ["blob", "soft-delete", "recovery"],
  },
  {
    externalId: "storage-009",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "hard",
    type: "single",
    prompt:
      "Your application uploads many large blobs. The SDK call is BlobClient.UploadAsync. Which option BEST tunes throughput for very large files over slow networks?",
    options: [
      { text: "Set StorageTransferOptions: InitialTransferSize, MaximumTransferSize, MaximumConcurrency", isCorrect: true, rationale: "Controls parallel block staging and chunk sizes." },
      { text: "Increase Tcp KeepAlive", isCorrect: false, rationale: "Negligible impact." },
      { text: "Enable Hot tier", isCorrect: false, rationale: "Tier is unrelated to upload throughput." },
      { text: "Use a Premium block-blob account exclusively", isCorrect: false, rationale: "Higher IOPS but doesn't tune SDK parallelism." },
    ],
    explanation:
      "Pass a StorageTransferOptions (or BlobUploadOptions.TransferOptions) to UploadAsync to control: InitialTransferSize (threshold above which the SDK switches to parallel block uploads), MaximumTransferSize (chunk size for each block), and MaximumConcurrency (parallel block uploads). Tuning these is the primary lever for large blob upload throughput.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/storage-blobs-tune-upload-download",
    tags: ["blob", "performance", "dotnet"],
  },
  {
    externalId: "storage-010",
    domain: "storage",
    topic: "Blob Storage",
    difficulty: "hard",
    type: "multi",
    prompt:
      "Which capabilities are part of Azure Blob immutable storage (WORM)? Select all that apply.",
    options: [
      { text: "Time-based retention policies", isCorrect: true, rationale: "Locks blobs for a specified period." },
      { text: "Legal holds with tags", isCorrect: true, rationale: "Hold blobs until the hold is removed." },
      { text: "Version-level immutability", isCorrect: true, rationale: "Apply WORM to specific blob versions, not just containers." },
      { text: "Auto-deletion when retention ends", isCorrect: false, rationale: "Retention prevents delete; doesn't auto-delete." },
      { text: "Compatible with Standard SMB shares", isCorrect: false, rationale: "WORM is a blob feature, not Files." },
    ],
    explanation:
      "Immutable blob storage offers (1) time-based retention policies that block delete/overwrite for N days, (2) legal holds (tags that block delete until explicitly cleared), and (3) version-level immutability so individual versions can be locked independently. Policies can be unlocked initially (test mode) and then locked irrevocably for compliance scenarios such as SEC 17a-4(f), CFTC, FINRA.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/immutable-storage-overview",
    tags: ["blob", "immutable", "compliance"],
  },

  // ---------- Cosmos DB ----------
  {
    externalId: "storage-020",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your Cosmos DB container queries by 'tenantId' 99% of the time, and 'tenantId' values are uniformly distributed across thousands of tenants. Which partition key is best?",
    options: [
      { text: "/id", isCorrect: false, rationale: "Per-document partition — kills query locality." },
      { text: "/tenantId", isCorrect: true, rationale: "Aligns partitioning with the most common query." },
      { text: "/createdAt", isCorrect: false, rationale: "Time-based keys cause hot partitions." },
      { text: "/region", isCorrect: false, rationale: "Few values cause hot partitions." },
    ],
    explanation:
      "Partition key selection in Cosmos DB optimizes for two things: (1) even distribution of storage and request volume, (2) most queries staying within a single logical partition. With many tenants whose work is uniform, /tenantId distributes well AND keeps the dominant query single-partition. Time-based or low-cardinality keys produce hot partitions and throttling.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/partitioning-overview",
    tags: ["cosmos", "partitioning"],
  },
  {
    externalId: "storage-021",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which Cosmos DB consistency levels GUARANTEE monotonic reads for a single client session? Select all that apply.",
    options: [
      { text: "Strong", isCorrect: true, rationale: "Linearizable; trivially monotonic." },
      { text: "Bounded staleness", isCorrect: true, rationale: "Reads lag writes by bounded version/time but are monotonic." },
      { text: "Session", isCorrect: true, rationale: "Default; monotonic within a session token." },
      { text: "Consistent prefix", isCorrect: false, rationale: "Returns prefixes in order across clients but does NOT guarantee monotonic-per-client." },
      { text: "Eventual", isCorrect: false, rationale: "No ordering guarantees." },
    ],
    explanation:
      "Cosmos DB's five consistency levels (from strongest to weakest): Strong, Bounded staleness, Session, Consistent prefix, Eventual. Session is the default and the right choice for most apps — it guarantees read-your-writes, monotonic reads/writes, and consistent prefix within a session (identified by the SessionToken). Consistent prefix does NOT guarantee monotonic reads across requests for an individual client.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/consistency-levels",
    tags: ["cosmos", "consistency"],
  },
  {
    externalId: "storage-022",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "easy",
    type: "single",
    prompt:
      "What is the cost unit used by Cosmos DB for both reads and writes?",
    options: [
      { text: "Database Transaction Units (DTU)", isCorrect: false, rationale: "DTU is an Azure SQL Database concept." },
      { text: "Request Units per second (RU/s)", isCorrect: true, rationale: "Cosmos DB throughput is provisioned in RU/s." },
      { text: "Compute Capacity Units (CCU)", isCorrect: false, rationale: "Not a Cosmos concept." },
      { text: "vCores", isCorrect: false, rationale: "Used by some vCore SKUs (e.g., MongoDB vCore) but not the throughput unit." },
    ],
    explanation:
      "Cosmos DB normalizes resource cost as Request Units (RUs). A 1 KB point read = 1 RU as a baseline. Writes cost ~5x more. Queries vary by complexity. Provisioned throughput is RU/s per container or per database (shared). Serverless billing is per RU consumed.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/request-units",
    tags: ["cosmos", "ru", "billing"],
  },
  {
    externalId: "storage-023",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "medium",
    type: "single",
    prompt:
      "Your team needs to react to changes in a Cosmos DB container with at-least-once delivery and per-partition order. Which feature do you use?",
    options: [
      { text: "Cosmos DB change feed", isCorrect: true, rationale: "Provides ordered, at-least-once stream of changes per partition." },
      { text: "Event Grid system topic on Cosmos DB", isCorrect: false, rationale: "Not the primitive for in-order processing of changes." },
      { text: "Service Bus topic with sessions", isCorrect: false, rationale: "Requires upstream publisher; doesn't observe Cosmos directly." },
      { text: "Polling /_changes endpoint manually", isCorrect: false, rationale: "Not the documented API; change feed processor handles this." },
    ],
    explanation:
      "The change feed is a persistent, ordered (per logical partition) record of inserts and updates. Use the change feed processor library (or Azure Functions Cosmos DB trigger, which wraps it) to consume changes reliably. Built-in lease container coordinates parallel consumers and checkpoints. Deletes are not in the change feed unless you use TTL with the 'all versions and deletes' mode.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/change-feed",
    tags: ["cosmos", "change-feed"],
  },
  {
    externalId: "storage-024",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "hard",
    type: "single",
    prompt:
      "A Cosmos DB container under provisioned throughput regularly returns HTTP 429. Which is the BEST first response?",
    options: [
      { text: "Switch to serverless mode", isCorrect: false, rationale: "Serverless has hard caps (~5000 RU/s, 50 GB) that may not suit." },
      { text: "Enable autoscale on the container", isCorrect: true, rationale: "Scales RU/s automatically up to 10x the floor, handling spikes." },
      { text: "Lower the indexing policy precision", isCorrect: false, rationale: "May help RU cost but is an optimization step, not the first fix." },
      { text: "Add more partition keys", isCorrect: false, rationale: "Partition key is immutable per container." },
    ],
    explanation:
      "Autoscale lets you set a maximum RU/s; Cosmos automatically scales between 10% of max and max based on usage. You only pay for the higher of (a) actual usage in that hour or (b) the 10% floor. It's the simplest answer to 'spiky workload returning 429'. After enabling, you can also profile expensive queries (Query Stats / x-ms-request-charge) and improve indexing.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/provision-throughput-autoscale",
    tags: ["cosmos", "autoscale", "throttling"],
  },
  {
    externalId: "storage-025",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which indexing mode skips automatic indexing of new documents in a Cosmos DB SQL API container?",
    options: [
      { text: "Consistent", isCorrect: false, rationale: "Default; synchronous indexing." },
      { text: "Lazy", isCorrect: false, rationale: "Deprecated; asynchronous but still indexes." },
      { text: "None", isCorrect: true, rationale: "Disables automatic indexing; useful for bulk-load + reindex." },
      { text: "Manual", isCorrect: false, rationale: "Not a valid mode name." },
    ],
    explanation:
      "Indexing modes: Consistent (default, synchronous), Lazy (deprecated), None (no indexing — used for high-throughput ingest where you query by id+partition key only). You can also customize what is indexed via includedPaths and excludedPaths and add composite indexes for multi-field ORDER BY or filtered queries.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/index-policy",
    tags: ["cosmos", "indexing"],
  },
  {
    externalId: "storage-026",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "hard",
    type: "single",
    prompt:
      "Which statement about Cosmos DB stored procedures is correct?",
    options: [
      { text: "They can execute across multiple logical partitions in a single transaction", isCorrect: false, rationale: "Scoped to one logical partition." },
      { text: "They execute as ACID transactions scoped to a single logical partition", isCorrect: true, rationale: "Transactional within one partition only." },
      { text: "They cannot mutate data, only read", isCorrect: false, rationale: "They can both read and write." },
      { text: "They are written in C#", isCorrect: false, rationale: "JavaScript only." },
    ],
    explanation:
      "Stored procedures (and triggers, UDFs) are JavaScript. SPs execute as ACID transactions but ONLY within a single logical partition — you must specify the partition key when calling. They are useful for batched writes that need transactional consistency on items sharing a key. Cross-partition operations have to be coordinated in client code.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/nosql/stored-procedures-triggers-udfs",
    tags: ["cosmos", "stored-procedures", "transactions"],
  },
  {
    externalId: "storage-027",
    domain: "storage",
    topic: "Cosmos DB",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Cosmos DB API supports MongoDB drivers and wire protocol?",
    options: [
      { text: "Cassandra", isCorrect: false, rationale: "CQL." },
      { text: "Gremlin", isCorrect: false, rationale: "Graph traversal." },
      { text: "MongoDB API (RU and vCore)", isCorrect: true, rationale: "Implements MongoDB wire protocol." },
      { text: "Table", isCorrect: false, rationale: "Azure Table Storage protocol." },
    ],
    explanation:
      "Cosmos DB exposes several APIs over the same global-distribution and multi-region-write engine: NoSQL (native, recommended for new work), MongoDB (RU and vCore — wire-protocol compatible), Cassandra (CQL-compatible), Gremlin (graph), and Table (Azure Tables compatible). Choose an API based on existing driver investment; new green-field apps usually pick NoSQL.",
    reference: "https://learn.microsoft.com/azure/cosmos-db/choose-api",
    tags: ["cosmos", "apis"],
  },

  // ---------- Table & Queue Storage ----------
  {
    externalId: "storage-040",
    domain: "storage",
    topic: "Queue Storage",
    difficulty: "easy",
    type: "single",
    prompt:
      "What is the maximum size of a single message in Azure Queue Storage?",
    options: [
      { text: "8 KB", isCorrect: false, rationale: "Old limit, no longer correct." },
      { text: "64 KB", isCorrect: true, rationale: "Current cap for a single message in Storage queues." },
      { text: "256 KB", isCorrect: false, rationale: "Service Bus standard tier message size." },
      { text: "1 MB", isCorrect: false, rationale: "Service Bus premium tier message size." },
    ],
    explanation:
      "Azure Queue Storage messages are up to 64 KB. The maximum TTL is 7 days by default but can be set to -1 (no expiration). For payloads larger than 64 KB, store the body in Blob storage and put a reference in the queue message. For richer features (sessions, dead-letter, transactions, larger messages), use Service Bus.",
    reference: "https://learn.microsoft.com/azure/storage/queues/storage-queues-introduction",
    tags: ["queue", "messaging"],
  },
  {
    externalId: "storage-041",
    domain: "storage",
    topic: "Table Storage",
    difficulty: "easy",
    type: "single",
    prompt:
      "Azure Table Storage primary key is composed of which two fields?",
    options: [
      { text: "Id and ETag", isCorrect: false, rationale: "ETag is for concurrency, not key." },
      { text: "PartitionKey and RowKey", isCorrect: true, rationale: "Together they uniquely identify an entity." },
      { text: "PartitionKey and Timestamp", isCorrect: false, rationale: "Timestamp is system-managed metadata." },
      { text: "Table name and RowKey", isCorrect: false, rationale: "Table is a container, not key." },
    ],
    explanation:
      "Entities are uniquely identified by the composite of PartitionKey + RowKey (both strings, up to 1 KB combined indexed). Operations on entities sharing a PartitionKey can be batched as Entity Group Transactions (up to 100 operations, 4 MB). Choose PartitionKey for query locality (similar to Cosmos DB Table API).",
    reference: "https://learn.microsoft.com/azure/storage/tables/table-storage-overview",
    tags: ["table", "keys"],
  },
  {
    externalId: "storage-042",
    domain: "storage",
    topic: "Storage Account",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which redundancy options replicate data across regions? Select all that apply.",
    options: [
      { text: "LRS", isCorrect: false, rationale: "Locally redundant — within one datacenter." },
      { text: "ZRS", isCorrect: false, rationale: "Across availability zones within one region." },
      { text: "GRS", isCorrect: true, rationale: "Geo-redundant: LRS + async copy to paired region." },
      { text: "RA-GRS", isCorrect: true, rationale: "GRS with read access to the secondary." },
      { text: "GZRS", isCorrect: true, rationale: "ZRS in primary + LRS replica in paired region." },
      { text: "RA-GZRS", isCorrect: true, rationale: "GZRS with read access to secondary." },
    ],
    explanation:
      "Single-region: LRS (3 copies in 1 DC), ZRS (3 copies across AZs). Cross-region (geo): GRS / RA-GRS (LRS + async copy to paired region; RA-* exposes a read endpoint on the secondary) and GZRS / RA-GZRS (ZRS primary + LRS replica in paired region; RA-* version exposes the read endpoint).",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-redundancy",
    tags: ["storage", "redundancy"],
  },
  {
    externalId: "storage-043",
    domain: "storage",
    topic: "Storage Account",
    difficulty: "medium",
    type: "single",
    prompt:
      "What is the most important reason to PREFER user-delegation SAS over service SAS in production?",
    options: [
      { text: "User-delegation SAS allows longer expiration times", isCorrect: false, rationale: "Actually limited to 7 days." },
      { text: "User-delegation SAS is signed with Microsoft Entra credentials, so no account key is exposed and revocation is faster", isCorrect: true, rationale: "Primary security benefit." },
      { text: "User-delegation SAS is the only way to grant cross-account access", isCorrect: false, rationale: "Wrong; cross-account uses different mechanisms." },
      { text: "Only user-delegation SAS supports container-scope", isCorrect: false, rationale: "Service SAS can also be container-scoped." },
    ],
    explanation:
      "Service and Account SAS are signed by the storage account key. If that key leaks, attackers can mint SAS tokens at will until the key is rotated. User-delegation SAS is signed by a user-delegation key derived from the caller's Microsoft Entra OAuth token; rotating that key (which is a separate operation) immediately invalidates outstanding tokens, and no account key is involved.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-sas-overview",
    tags: ["storage", "sas", "security"],
  },
  {
    externalId: "storage-044",
    domain: "storage",
    topic: "Storage Account",
    difficulty: "hard",
    type: "single",
    prompt:
      "You disable the storage account's public network access. App Service must still write blobs from a VNet-integrated app. What is the minimum networking change required?",
    options: [
      { text: "Add the app's outbound IPs to the storage firewall", isCorrect: false, rationale: "Outbound IPs from VNet-integrated apps are not the public ones and rotate." },
      { text: "Create a Private Endpoint for the blob sub-resource and configure DNS to resolve to the private IP", isCorrect: true, rationale: "Standard pattern for private connectivity." },
      { text: "Create a Service Endpoint on the subnet only", isCorrect: false, rationale: "Doesn't work when public access is fully disabled." },
      { text: "Switch the storage account to GZRS", isCorrect: false, rationale: "Redundancy is unrelated." },
    ],
    explanation:
      "When publicNetworkAccess is disabled, the public endpoint is unreachable. A Private Endpoint projects a private IP into your VNet for a specific sub-resource (blob, file, queue, table, dfs, web). DNS must resolve <account>.blob.core.windows.net to the private IP — use the Azure Private DNS Zone (privatelink.blob.core.windows.net) integrated with the VNet, and the storage SDK works unchanged.",
    reference: "https://learn.microsoft.com/azure/private-link/tutorial-private-endpoint-storage-portal",
    tags: ["storage", "private-endpoint", "networking"],
  },
];
