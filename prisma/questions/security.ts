import type { SeedQuestion } from "./types";

export const securityQuestions: SeedQuestion[] = [
  // ---------- Microsoft Entra / MSAL ----------
  {
    externalId: "security-001",
    domain: "security",
    topic: "Microsoft Entra",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which OAuth 2.0 flow should a server-side web API use to call another API on behalf of the signed-in user?",
    options: [
      { text: "Authorization Code with PKCE", isCorrect: false, rationale: "Used for user sign-in to a client, not service-to-service on-behalf-of." },
      { text: "Client Credentials", isCorrect: false, rationale: "App-only; loses user context." },
      { text: "On-Behalf-Of (OBO)", isCorrect: true, rationale: "Designed for exactly this pattern." },
      { text: "Device Code", isCorrect: false, rationale: "For input-constrained devices." },
    ],
    explanation:
      "The On-Behalf-Of (OBO) flow lets a middle-tier API exchange an incoming user access token for a new access token to a downstream API, preserving the user identity. Configure delegated permissions on the downstream API and grant the middle-tier API consent. Client Credentials would call the downstream API as the app itself, not as the user — losing user-specific authorization decisions.",
    reference: "https://learn.microsoft.com/entra/identity-platform/v2-oauth2-on-behalf-of-flow",
    tags: ["entra", "oauth", "obo"],
  },
  {
    externalId: "security-002",
    domain: "security",
    topic: "Microsoft Entra",
    difficulty: "medium",
    type: "single",
    prompt:
      "A single-page React app needs to call Microsoft Graph. Which OAuth 2.0 flow should it use?",
    options: [
      { text: "Implicit Grant", isCorrect: false, rationale: "Deprecated for SPAs due to token-in-URL exposure." },
      { text: "Authorization Code with PKCE", isCorrect: true, rationale: "Current recommendation for SPAs." },
      { text: "Resource Owner Password Credentials", isCorrect: false, rationale: "Requires the SPA to handle credentials directly; deprecated." },
      { text: "Client Credentials", isCorrect: false, rationale: "App-only flow — no user context." },
    ],
    explanation:
      "Modern SPAs (and MSAL.js v2+) use Authorization Code with PKCE: the SPA requests an auth code, then exchanges it for a token using a code_verifier. PKCE protects against intercepted codes, eliminates the need for a client secret, and is safe in browser environments. Implicit Grant returned tokens directly in the URL fragment and is now discouraged.",
    reference: "https://learn.microsoft.com/entra/identity-platform/v2-oauth2-auth-code-flow",
    tags: ["entra", "oauth", "spa", "pkce"],
  },
  {
    externalId: "security-003",
    domain: "security",
    topic: "Microsoft Entra",
    difficulty: "hard",
    type: "single",
    prompt:
      "Your daemon service needs to call Microsoft Graph as itself (no user). Which combination is correct?",
    options: [
      { text: "Application permissions + Client Credentials flow + admin consent", isCorrect: true, rationale: "Standard daemon pattern." },
      { text: "Delegated permissions + Authorization Code + user consent", isCorrect: false, rationale: "Requires a user; not a daemon scenario." },
      { text: "Application permissions + On-Behalf-Of + user consent", isCorrect: false, rationale: "OBO requires an incoming user token." },
      { text: "Delegated permissions + Client Credentials", isCorrect: false, rationale: "Client Credentials uses application, not delegated, permissions." },
    ],
    explanation:
      "Daemons run with no signed-in user. They use the Client Credentials flow and request application permissions (which always require admin consent). Tokens contain 'roles' claims rather than 'scp'. Avoid using app permissions when delegated would work — app permissions are typically broader (tenant-wide) and have higher blast radius.",
    reference: "https://learn.microsoft.com/entra/identity-platform/v2-oauth2-client-creds-grant-flow",
    tags: ["entra", "oauth", "daemon"],
  },
  {
    externalId: "security-004",
    domain: "security",
    topic: "MSAL",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which MSAL method should an interactive desktop app prefer for acquiring tokens to provide silent token refresh whenever possible?",
    options: [
      { text: "AcquireTokenInteractive only", isCorrect: false, rationale: "Always prompts the user." },
      { text: "AcquireTokenSilent first, fall back to AcquireTokenInteractive on MsalUiRequiredException", isCorrect: true, rationale: "Standard MSAL pattern." },
      { text: "AcquireTokenForClient", isCorrect: false, rationale: "Confidential client (daemon)." },
      { text: "AcquireTokenWithDeviceCode", isCorrect: false, rationale: "Used only for input-constrained devices." },
    ],
    explanation:
      "MSAL caches tokens transparently. The recommended pattern is: try AcquireTokenSilent (which returns a cached or refreshed token without UI), and only fall back to AcquireTokenInteractive if MsalUiRequiredException is thrown (cache miss, consent needed, MFA required, conditional access challenge, etc.). This gives the best user experience.",
    reference: "https://learn.microsoft.com/entra/identity-platform/scenario-desktop-acquire-token",
    tags: ["entra", "msal", "tokens"],
  },
  {
    externalId: "security-005",
    domain: "security",
    topic: "Microsoft Entra",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which token contains a 'scp' (scope) claim?",
    options: [
      { text: "ID token", isCorrect: false, rationale: "ID tokens convey user identity, not API scopes." },
      { text: "Access token issued from a delegated flow", isCorrect: true, rationale: "scp contains the granted delegated scopes." },
      { text: "Access token issued via Client Credentials", isCorrect: false, rationale: "Uses 'roles' (application permissions), not scp." },
      { text: "Refresh token", isCorrect: false, rationale: "Opaque, not a JWT for the resource." },
    ],
    explanation:
      "Access tokens for delegated flows carry the 'scp' claim listing the consented scopes (space-delimited). App-only tokens (Client Credentials) carry 'roles' instead. APIs should verify scp/roles to enforce that the caller is authorized for the specific operation. ID tokens describe WHO the user is and are not meant to authorize API calls.",
    reference: "https://learn.microsoft.com/entra/identity-platform/access-tokens",
    tags: ["entra", "tokens", "scopes"],
  },

  // ---------- Managed Identity ----------
  {
    externalId: "security-010",
    domain: "security",
    topic: "Managed Identity",
    difficulty: "easy",
    type: "single",
    prompt:
      "What is the main difference between a system-assigned and a user-assigned managed identity?",
    options: [
      { text: "System-assigned identities can be shared across resources; user-assigned cannot", isCorrect: false, rationale: "Reversed — user-assigned is the shareable type." },
      { text: "System-assigned is tied to the resource lifecycle; user-assigned exists independently and can be assigned to multiple resources", isCorrect: true, rationale: "Core distinction." },
      { text: "Only user-assigned identities can be used by Azure Functions", isCorrect: false, rationale: "Both work for Functions." },
      { text: "System-assigned identities require a client secret", isCorrect: false, rationale: "Managed identities have no secrets." },
    ],
    explanation:
      "System-assigned identity is created with the resource and deleted with it — 1:1 lifecycle. User-assigned identity is a standalone Azure resource you create and then assign to one or many compute resources. User-assigned is preferred when several apps need the same permissions, or when you want to pre-create permissions before deploying the workload.",
    reference: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/overview",
    tags: ["managed-identity", "entra"],
  },
  {
    externalId: "security-011",
    domain: "security",
    topic: "Managed Identity",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Azure.Identity credential type should production .NET code use to seamlessly work locally (developer credentials) and in Azure (managed identity)?",
    options: [
      { text: "ManagedIdentityCredential", isCorrect: false, rationale: "Only works in Azure — fails locally." },
      { text: "ClientSecretCredential", isCorrect: false, rationale: "Requires app registration + secret; not ideal." },
      { text: "DefaultAzureCredential", isCorrect: true, rationale: "Chains many credential sources, environment-aware." },
      { text: "AzureCliCredential", isCorrect: false, rationale: "Only works locally; fails in Azure compute." },
    ],
    explanation:
      "DefaultAzureCredential tries a sequence of credential sources: EnvironmentCredential → WorkloadIdentityCredential → ManagedIdentityCredential → SharedTokenCacheCredential → VisualStudioCredential → AzureCliCredential → AzurePowerShellCredential → AzureDeveloperCliCredential → InteractiveBrowserCredential. The same code works in Azure (managed identity) and locally (CLI / VS), reducing environment-specific branching.",
    reference: "https://learn.microsoft.com/dotnet/api/azure.identity.defaultazurecredential",
    tags: ["managed-identity", "azure-identity", "dotnet"],
  },
  {
    externalId: "security-012",
    domain: "security",
    topic: "Managed Identity",
    difficulty: "medium",
    type: "single",
    prompt:
      "A VM with a system-assigned identity must access a Storage account. After granting Storage Blob Data Reader, downloads still return 403. The token was retrieved successfully. What is the most likely root cause?",
    options: [
      { text: "The Storage account requires the Storage Account Contributor role", isCorrect: false, rationale: "Contributor is management plane, not data plane." },
      { text: "Role assignments take a few minutes to propagate", isCorrect: true, rationale: "RBAC propagation latency is the most common cause." },
      { text: "Managed identities cannot access Storage", isCorrect: false, rationale: "They can." },
      { text: "TLS 1.2 is required", isCorrect: false, rationale: "Default but not the cause of 403." },
    ],
    explanation:
      "Microsoft Entra RBAC role assignments typically propagate within a few minutes but can take up to 30. If you just granted a role, retry after a few minutes. Also double-check the role chosen matches the operation (data-plane roles like 'Storage Blob Data Reader' for blob reads vs management-plane roles like 'Storage Account Contributor'). Use Azure CLI 'az role assignment list --assignee <principal-id>' to confirm.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/troubleshooting",
    tags: ["managed-identity", "rbac", "troubleshooting"],
  },
  {
    externalId: "security-013",
    domain: "security",
    topic: "Managed Identity",
    difficulty: "hard",
    type: "single",
    prompt:
      "Inside an Azure VM, which endpoint should code call to obtain an access token using the system-assigned managed identity?",
    options: [
      { text: "https://login.microsoftonline.com/common/oauth2/v2.0/token", isCorrect: false, rationale: "Entra token endpoint; requires client secret/cert/MI federation." },
      { text: "http://169.254.169.254/metadata/identity/oauth2/token", isCorrect: true, rationale: "Azure Instance Metadata Service (IMDS) endpoint." },
      { text: "https://management.azure.com/.auth/me", isCorrect: false, rationale: "Used by App Service Easy Auth, not VMs." },
      { text: "https://imds.azure.com/", isCorrect: false, rationale: "Not the correct path." },
    ],
    explanation:
      "On VMs, VMSS, and AKS nodes, code obtains MSI tokens from the Instance Metadata Service (IMDS) at http://169.254.169.254/metadata/identity/oauth2/token?api-version=2018-02-01&resource=<resource>. The Azure.Identity SDK does this for you. App Service / Functions use a different mechanism (IDENTITY_ENDPOINT + IDENTITY_HEADER environment variables) — also abstracted by the SDK.",
    reference: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/how-to-use-vm-token",
    tags: ["managed-identity", "imds"],
  },
  {
    externalId: "security-014",
    domain: "security",
    topic: "Managed Identity",
    difficulty: "medium",
    type: "multi",
    prompt:
      "Which Azure resources support managed identities? Select all that apply.",
    options: [
      { text: "Azure VM / VMSS", isCorrect: true, rationale: "Original support, via IMDS." },
      { text: "App Service / Functions", isCorrect: true, rationale: "Yes, both system and user assigned." },
      { text: "Azure Container Apps", isCorrect: true, rationale: "Supported." },
      { text: "Azure Kubernetes Service (via Workload Identity)", isCorrect: true, rationale: "Pod-level identities via OIDC federation." },
      { text: "Azure Logic Apps (Standard and Consumption)", isCorrect: true, rationale: "Both support MI." },
      { text: "Storage Account itself", isCorrect: false, rationale: "Storage doesn't 'have' an MI — it consumes Entra principals." },
    ],
    explanation:
      "Managed identities are issued to compute resources that need to authenticate to Azure services. Compute resources that support MI include VMs, VMSS, App Service, Functions, Container Apps, Container Instances, AKS (via Workload Identity), Logic Apps, API Management, Data Factory, etc. Storage, Key Vault, SQL — these are TARGETS that consume Entra identities, not issuers.",
    reference: "https://learn.microsoft.com/entra/identity/managed-identities-azure-resources/managed-identities-status",
    tags: ["managed-identity", "support"],
  },

  // ---------- Key Vault ----------
  {
    externalId: "security-020",
    domain: "security",
    topic: "Key Vault",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which Key Vault object type stores arbitrary text (such as a connection string) up to 25 KB?",
    options: [
      { text: "Key", isCorrect: false, rationale: "RSA/EC cryptographic keys." },
      { text: "Secret", isCorrect: true, rationale: "General-purpose secret value." },
      { text: "Certificate", isCorrect: false, rationale: "X.509 cert, often paired with a key." },
      { text: "Managed HSM key", isCorrect: false, rationale: "Special HSM-backed keys, not text." },
    ],
    explanation:
      "Key Vault stores three object types: Keys (RSA / EC, optionally HSM-protected, for cryptographic ops like sign / encrypt / wrap), Secrets (arbitrary octet strings, e.g., connection strings, API keys, up to 25 KB), and Certificates (X.509 with linked key + secret for full lifecycle management). For storing a SQL connection string, use a Secret.",
    reference: "https://learn.microsoft.com/azure/key-vault/general/about-keys-secrets-certificates",
    tags: ["key-vault", "secrets"],
  },
  {
    externalId: "security-021",
    domain: "security",
    topic: "Key Vault",
    difficulty: "medium",
    type: "single",
    prompt:
      "You created a Key Vault with the access policies permission model and granted your app 'Get' on secrets. The app still gets 403. Which is the most likely missing step?",
    options: [
      { text: "The vault must be in the same region as the app", isCorrect: false, rationale: "Region is irrelevant for access." },
      { text: "The access policy was not saved (separate Save click) or is on a different identity than the one used at runtime", isCorrect: true, rationale: "Both are common mistakes." },
      { text: "Soft delete is blocking access", isCorrect: false, rationale: "Soft delete affects deleted objects, not access control." },
      { text: "You must use Azure RBAC instead", isCorrect: false, rationale: "Access policies are valid; RBAC is just an alternative." },
    ],
    explanation:
      "Two frequent mistakes when using access policies: (1) the portal requires you to click 'Save' after adding/editing — adding a row is not committed until then; (2) the identity you granted is different from the runtime identity (e.g., you granted your user account but the app uses a system-assigned MI). Verify the runtime principal with logs or by inspecting the access token. Microsoft now recommends Azure RBAC for Key Vault permissions as the more consistent model.",
    reference: "https://learn.microsoft.com/azure/key-vault/general/assign-access-policy",
    tags: ["key-vault", "access-control"],
  },
  {
    externalId: "security-022",
    domain: "security",
    topic: "Key Vault",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Key Vault feature provides automated certificate renewal with a public CA partner like DigiCert or GlobalSign?",
    options: [
      { text: "Soft delete", isCorrect: false, rationale: "Recovery feature, not lifecycle." },
      { text: "Certificate auto-rotation via configured issuer", isCorrect: true, rationale: "Key Vault talks to integrated CAs to renew automatically." },
      { text: "Managed HSM mirroring", isCorrect: false, rationale: "Concerns HSM keys, not certs." },
      { text: "Purge protection", isCorrect: false, rationale: "Blocks permanent delete of soft-deleted items." },
    ],
    explanation:
      "Key Vault can manage the full lifecycle of public certificates by acting as a client for integrated CAs (DigiCert, GlobalSign — and you can also bring your own CA). Configure the issuer with credentials, then set the certificate policy with renewal triggers (e.g., 30 days before expiry). Key Vault submits the renewal, gets the new cert, and stores it as a new version automatically.",
    reference: "https://learn.microsoft.com/azure/key-vault/certificates/about-certificates",
    tags: ["key-vault", "certificates", "lifecycle"],
  },
  {
    externalId: "security-023",
    domain: "security",
    topic: "Key Vault",
    difficulty: "hard",
    type: "multi",
    prompt:
      "Which configurations help PREVENT permanent loss of a Key Vault secret due to accidental or malicious deletion? Select all that apply.",
    options: [
      { text: "Soft delete enabled (mandatory now)", isCorrect: true, rationale: "Deleted items remain recoverable for 7-90 days." },
      { text: "Purge protection enabled", isCorrect: true, rationale: "Blocks anyone from permanently purging during the retention." },
      { text: "RBAC with break-glass account", isCorrect: false, rationale: "Helps access but does not prevent purge." },
      { text: "Backup secrets to another vault in a different region", isCorrect: true, rationale: "Defense in depth for catastrophic loss." },
      { text: "Diagnostic logging to Log Analytics", isCorrect: false, rationale: "Detective control, not preventive." },
    ],
    explanation:
      "Soft delete is now always-on. Purge protection (optional but recommended) prevents anyone — including Key Vault administrators — from purging soft-deleted items before the retention period ends; this defeats a malicious 'delete + purge' attack. Out-of-band backups to another vault add geographic resilience. Diagnostic logs help DETECT problems but don't prevent loss.",
    reference: "https://learn.microsoft.com/azure/key-vault/general/soft-delete-overview",
    tags: ["key-vault", "soft-delete", "purge-protection"],
  },

  // ---------- RBAC ----------
  {
    externalId: "security-030",
    domain: "security",
    topic: "RBAC",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which built-in role lets a user read everything in a subscription but make no changes?",
    options: [
      { text: "Owner", isCorrect: false, rationale: "Full control, including role assignments." },
      { text: "Contributor", isCorrect: false, rationale: "Can create/modify but cannot grant access." },
      { text: "Reader", isCorrect: true, rationale: "Read-only across resources at scope." },
      { text: "User Access Administrator", isCorrect: false, rationale: "Manages access only." },
    ],
    explanation:
      "Azure has four primary built-in roles: Owner (everything), Contributor (everything except role assignments), Reader (read-only), and User Access Administrator (only manages who has access). For data-plane operations (e.g., reading blob contents), management-plane Reader is NOT enough — you also need a data-plane role like 'Storage Blob Data Reader'.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/built-in-roles",
    tags: ["rbac", "roles"],
  },
  {
    externalId: "security-031",
    domain: "security",
    topic: "RBAC",
    difficulty: "medium",
    type: "single",
    prompt:
      "A user has 'Contributor' assigned at the subscription scope and 'Reader' assigned at a resource group within that subscription. What can they do in that resource group?",
    options: [
      { text: "Only what Reader allows; the more restrictive role wins", isCorrect: false, rationale: "RBAC is additive, not restrictive." },
      { text: "What Contributor allows; permissions are additive (union)", isCorrect: true, rationale: "Azure RBAC is additive; the union of permissions applies." },
      { text: "Nothing; conflicting roles cancel out", isCorrect: false, rationale: "Roles do not conflict in that sense." },
      { text: "Only what the deny assignment dictates", isCorrect: false, rationale: "No deny assignment was mentioned." },
    ],
    explanation:
      "Azure RBAC is purely additive — the effective permission set is the UNION of all role assignments that apply at or above the scope. The only way to remove permissions is to remove the assignment or use a deny assignment (which is rarely created directly; created by services like Blueprints / Managed Apps). To restrict access at the resource group, do NOT grant Contributor at the subscription.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/overview",
    tags: ["rbac", "scopes"],
  },
  {
    externalId: "security-032",
    domain: "security",
    topic: "RBAC",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which built-in role grants the minimum permissions for an app to manage role assignments on a single key vault?",
    options: [
      { text: "Owner", isCorrect: false, rationale: "Over-privileged." },
      { text: "User Access Administrator scoped to the key vault", isCorrect: true, rationale: "Smallest role that includes role-assignment management." },
      { text: "Contributor scoped to the key vault", isCorrect: false, rationale: "Contributor does NOT include role assignment." },
      { text: "Key Vault Administrator", isCorrect: false, rationale: "Manages keys/secrets/data plane; not Azure RBAC assignments." },
    ],
    explanation:
      "Only Owner and User Access Administrator include Microsoft.Authorization/roleAssignments/write. Contributor explicitly excludes it. To delegate role-assignment management for a single resource without giving away control of its data plane, assign User Access Administrator scoped to that resource. Key Vault Administrator is a data-plane role for managing keys/secrets/certs — not for assigning Azure roles.",
    reference: "https://learn.microsoft.com/azure/role-based-access-control/built-in-roles",
    tags: ["rbac", "key-vault", "least-privilege"],
  },
  {
    externalId: "security-033",
    domain: "security",
    topic: "RBAC",
    difficulty: "hard",
    type: "single",
    prompt:
      "You want to grant a service principal data-plane read on blobs of one container only (not the whole storage account). Which combination is correct?",
    options: [
      { text: "Assign 'Storage Blob Data Reader' at the subscription scope", isCorrect: false, rationale: "Over-broad." },
      { text: "Assign 'Storage Blob Data Reader' scoped to the blob container resource ID", isCorrect: true, rationale: "Scope can be down to the container." },
      { text: "Use a service SAS for the container", isCorrect: false, rationale: "SAS isn't an RBAC role." },
      { text: "Assign 'Reader' at the container scope", isCorrect: false, rationale: "Reader is management plane and doesn't enable blob data reads." },
    ],
    explanation:
      "Azure RBAC scopes for blob storage include: management group → subscription → resource group → storage account → blob container → individual blob. Assign 'Storage Blob Data Reader' at the container scope to grant least-privilege read of only that container's blobs. Scoping at the storage account is also fine but broader. SAS is an alternative authorization mechanism — not RBAC.",
    reference: "https://learn.microsoft.com/azure/storage/blobs/assign-azure-role-data-access",
    tags: ["rbac", "blob", "least-privilege"],
  },

  // ---------- SAS / Access ----------
  {
    externalId: "security-040",
    domain: "security",
    topic: "SAS",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which SAS types can ONLY be created by signing with the storage account key (i.e., not using Microsoft Entra credentials)?",
    options: [
      { text: "User-delegation SAS only", isCorrect: false, rationale: "User-delegation SAS uses an Entra-signed delegation key, not the account key." },
      { text: "Service SAS only", isCorrect: false, rationale: "Service SAS uses the account key, but so does Account SAS." },
      { text: "Account SAS only", isCorrect: false, rationale: "Account SAS uses the account key, but so does Service SAS." },
      { text: "Both Service SAS and Account SAS", isCorrect: true, rationale: "Both are signed by the account key; only User-delegation SAS uses Entra." },
    ],
    explanation:
      "Three SAS types: Account SAS (key-signed, account-wide), Service SAS (key-signed, single service or container/file share), and User-delegation SAS (Entra-signed, blob storage only). Both Service SAS and Account SAS rely on the storage account key — if you want to avoid using the account key in production, prefer User-delegation SAS.",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-sas-overview",
    tags: ["sas", "storage"],
  },
  {
    externalId: "security-041",
    domain: "security",
    topic: "SAS",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which SAS parameter limits the source IPs that may use the token?",
    options: [
      { text: "sip", isCorrect: true, rationale: "IP / range restriction." },
      { text: "se", isCorrect: false, rationale: "Expiry time." },
      { text: "sp", isCorrect: false, rationale: "Permissions." },
      { text: "spr", isCorrect: false, rationale: "Protocol (https or https,http)." },
    ],
    explanation:
      "SAS query parameters include sv (version), ss (signed services), srt (resource types), sp (permissions), st (start), se (expiry), sip (source IP or CIDR range), spr (protocol), sig (signature), and others. Restrict sip and require spr=https for any production SAS handed to external parties.",
    reference: "https://learn.microsoft.com/rest/api/storageservices/create-account-sas",
    tags: ["sas", "security"],
  },
  {
    externalId: "security-042",
    domain: "security",
    topic: "SAS",
    difficulty: "medium",
    type: "single",
    prompt:
      "You need to be able to revoke a previously-issued service SAS BEFORE its expiry. Which feature lets you do that?",
    options: [
      { text: "Stored access policy", isCorrect: true, rationale: "SAS bound to a stored access policy is revocable by deleting/changing the policy." },
      { text: "Set spr=https only", isCorrect: false, rationale: "Protocol restriction, not revocation." },
      { text: "Rotate the storage account key", isCorrect: false, rationale: "Invalidates ALL key-signed SAS at once — blunt instrument." },
      { text: "Soft-delete the blob", isCorrect: false, rationale: "Unrelated to SAS validity." },
    ],
    explanation:
      "A stored access policy lives on a container/queue/table/file share and groups permissions, start/expiry. A SAS that references the policy by name (si=<policy-name>) inherits its constraints. To revoke, delete or change the policy — all SAS bound to it stop working immediately. Without a policy, the only revocation mechanism is rotating the account key (which invalidates everything).",
    reference: "https://learn.microsoft.com/azure/storage/common/storage-sas-overview#stored-access-policies",
    tags: ["sas", "revocation"],
  },

  // ---------- App Security / TLS / Easy Auth ----------
  {
    externalId: "security-050",
    domain: "security",
    topic: "App Service Auth",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which App Service feature provides built-in OAuth/OIDC authentication with no code changes?",
    options: [
      { text: "App Service Authentication / Authorization (Easy Auth)", isCorrect: true, rationale: "Adds federated auth in front of your app." },
      { text: "Azure AD B2C", isCorrect: false, rationale: "Identity provider for customer-facing apps, not a built-in App Service feature." },
      { text: "Microsoft Identity Manager", isCorrect: false, rationale: "On-prem identity sync, irrelevant." },
      { text: "App Service Identity", isCorrect: false, rationale: "Not the official name; refers to managed identity, different feature." },
    ],
    explanation:
      "App Service Authentication, often called 'Easy Auth', is a sidecar module that intercepts incoming requests, redirects unauthenticated callers to your chosen provider (Microsoft Entra, Microsoft account, Google, Facebook, Twitter, Apple, or any OIDC provider), validates the token, and injects the user identity into request headers / claims accessible via /.auth/me. Your app code remains unchanged.",
    reference: "https://learn.microsoft.com/azure/app-service/overview-authentication-authorization",
    tags: ["app-service", "easy-auth", "oauth"],
  },
  {
    externalId: "security-051",
    domain: "security",
    topic: "TLS",
    difficulty: "medium",
    type: "single",
    prompt:
      "An App Service Custom Domain shows TLS errors in the browser. The cert is uploaded but the binding isn't visible on the domain. Which Cert Type binding allows the cert to be exclusively for this app and renewed/auto-managed by App Service?",
    options: [
      { text: "App Service Managed Certificate", isCorrect: true, rationale: "Free, auto-renewing, bound to a hostname." },
      { text: "IP SSL with a public-CA cert", isCorrect: false, rationale: "Works but not auto-managed by App Service." },
      { text: "Wildcard cert from your CA", isCorrect: false, rationale: "Manual cert; not auto-managed." },
      { text: "Self-signed cert", isCorrect: false, rationale: "Browsers will reject." },
    ],
    explanation:
      "App Service Managed Certificates are free certs Azure issues and auto-renews for your custom domain. Limitations: hostname must be CNAMEd to the app, not a wildcard (managed certs for wildcards became GA more recently — check current docs), Linux requires Basic+ plan, and they are SNI-only. For more flexibility or wildcards, use Key Vault certificates.",
    reference: "https://learn.microsoft.com/azure/app-service/configure-ssl-certificate",
    tags: ["app-service", "tls", "certificates"],
  },
  {
    externalId: "security-052",
    domain: "security",
    topic: "Microsoft Graph",
    difficulty: "medium",
    type: "single",
    prompt:
      "Which Microsoft Graph permission TYPE is consented by an end user without admin approval (assuming the permission itself does not require admin consent)?",
    options: [
      { text: "Application permissions", isCorrect: false, rationale: "Always require admin consent." },
      { text: "Delegated permissions", isCorrect: true, rationale: "Can be user-consented unless flagged as admin-required." },
      { text: "Both, equally", isCorrect: false, rationale: "Not equivalent." },
      { text: "Neither — only admin can consent", isCorrect: false, rationale: "False for most basic delegated scopes." },
    ],
    explanation:
      "Delegated permissions act on behalf of a signed-in user. Many can be consented by the user (e.g., User.Read), while higher-risk ones (Directory.Read.All, User.ReadWrite.All, etc.) are marked admin-only. Application permissions are app-only (no user) and ALWAYS require admin consent. Use the Graph permissions reference to check the consent requirement for any specific scope.",
    reference: "https://learn.microsoft.com/graph/permissions-reference",
    tags: ["graph", "consent", "permissions"],
  },
  {
    externalId: "security-053",
    domain: "security",
    topic: "Microsoft Graph",
    difficulty: "easy",
    type: "single",
    prompt:
      "Which client library is recommended to call Microsoft Graph from .NET?",
    options: [
      { text: "System.Net.Http.HttpClient directly", isCorrect: false, rationale: "Works but lacks paging, batching, retries." },
      { text: "Microsoft.Graph SDK (GraphServiceClient)", isCorrect: true, rationale: "Official typed client with paging and middleware." },
      { text: "Azure.Storage.Blobs", isCorrect: false, rationale: "Wrong service." },
      { text: "Azure.Identity only", isCorrect: false, rationale: "Identity-only; lacks Graph helpers." },
    ],
    explanation:
      "Microsoft.Graph (GraphServiceClient) is the official SDK. It composes nicely with Azure.Identity for token acquisition (just pass a TokenCredential). The SDK handles paging via PageIterator, batching, retries, and provides strongly typed models. Direct HttpClient is fine for edge cases but you reimplement these features.",
    reference: "https://learn.microsoft.com/graph/sdks/sdks-overview",
    tags: ["graph", "dotnet", "sdk"],
  },
  {
    externalId: "security-054",
    domain: "security",
    topic: "Encryption",
    difficulty: "hard",
    type: "single",
    prompt:
      "A compliance requirement says: 'we must control our own encryption keys, with the ability to revoke at any time, for blob data at rest'. Which option meets this?",
    options: [
      { text: "Microsoft-managed keys (default)", isCorrect: false, rationale: "Keys not customer-controlled." },
      { text: "Customer-managed keys (CMK) in Key Vault or Managed HSM", isCorrect: true, rationale: "Customer holds the encryption key encryption key." },
      { text: "Client-side encryption only", isCorrect: false, rationale: "Possible but not what 'data at rest' typically references for Azure-side compliance." },
      { text: "Double encryption with infrastructure key", isCorrect: false, rationale: "Adds a second layer but does not give customer control." },
    ],
    explanation:
      "Storage encryption at rest is always on. By default keys are Microsoft-managed. For customer control, configure CMK: storage uses a key stored in your Key Vault or Managed HSM to wrap the data encryption keys. You can rotate or revoke the key — revoking will make the data inaccessible until you restore access. Combine with key auto-rotation if desired.",
    reference: "https://learn.microsoft.com/azure/storage/common/customer-managed-keys-overview",
    tags: ["storage", "encryption", "cmk"],
  },
];
