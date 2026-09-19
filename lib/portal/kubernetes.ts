// Mock data for the Kubernetes Dashboard (Infrastructure → Kubernetes fleet).
// No real cluster is connected — this mirrors the shape of a real fleet
// admin UI (cluster list → per-cluster nodes/workloads) so the portal can
// demo cluster administration end to end.

export type Environment = "production" | "staging";

export interface ClusterMeta {
  id: string;
  name: string;
  cloud: string;
  region: string;
  version: string;
  environment: Environment;
  cost: string;
  createdAt: string;
}

export type NodeStatus = "Ready" | "NotReady" | "SchedulingDisabled";

export interface K8sNode {
  id: string;
  clusterId: string;
  name: string;
  status: NodeStatus;
  roles: string[];
  instanceType: string;
  zone: string;
  cpuPercent: number;
  memoryPercent: number;
  pods: number;
  podsCapacity: number;
  age: string;
}

export interface K8sNamespace {
  id: string;
  clusterId: string;
  name: string;
  status: "Active" | "Terminating";
  pods: number;
  age: string;
}

export type WorkloadKind = "Deployment" | "StatefulSet" | "DaemonSet" | "CronJob";
export type WorkloadStatus = "Running" | "Degraded" | "Scheduled" | "Pending";

export interface K8sWorkload {
  id: string;
  clusterId: string;
  name: string;
  kind: WorkloadKind;
  namespace: string;
  image: string;
  readyReplicas: number;
  desiredReplicas: number;
  status: WorkloadStatus;
  restarts: number;
  age: string;
  cpuPercent: number;
  memoryPercent: number;
  /** One-line summary of what's wrong, set only when status !== "Running" | "Scheduled". */
  issue?: string;
}

export type PodStatus = "Running" | "Pending" | "CrashLoopBackOff" | "ImagePullBackOff" | "Completed";

export interface K8sPod {
  id: string;
  workloadId: string;
  name: string;
  status: PodStatus;
  node: string;
  restarts: number;
  age: string;
  cpuPercent: number;
  memoryPercent: number;
}

export type EventType = "Normal" | "Warning";

export interface K8sEvent {
  id: string;
  workloadId: string;
  type: EventType;
  reason: string;
  message: string;
  count: number;
  lastSeen: string;
}

/* ── Fleet: two clusters, one degraded (prod) and one healthy (staging) ── */

export const CLUSTERS: ClusterMeta[] = [
  { id: "prod-eks-cluster", name: "prod-eks-cluster", cloud: "AWS", region: "us-east-1", version: "v1.29", environment: "production", cost: "$620/mo", createdAt: "Mar 5, 2026" },
  { id: "staging-eks-cluster", name: "staging-eks-cluster", cloud: "AWS", region: "us-west-2", version: "v1.29", environment: "staging", cost: "$140/mo", createdAt: "Apr 2, 2026" },
];

export function getCluster(clusterId: string): ClusterMeta | undefined {
  return CLUSTERS.find((c) => c.id === clusterId);
}

export const NODES: K8sNode[] = [
  { id: "node-1", clusterId: "prod-eks-cluster", name: "ip-10-0-1-12.ec2.internal", status: "Ready", roles: ["control-plane"], instanceType: "m5.xlarge", zone: "us-east-1a", cpuPercent: 62, memoryPercent: 71, pods: 24, podsCapacity: 58, age: "76d" },
  { id: "node-2", clusterId: "prod-eks-cluster", name: "ip-10-0-1-45.ec2.internal", status: "Ready", roles: ["worker"], instanceType: "m5.xlarge", zone: "us-east-1b", cpuPercent: 71, memoryPercent: 84, pods: 29, podsCapacity: 58, age: "76d" },
  { id: "node-3", clusterId: "prod-eks-cluster", name: "ip-10-0-2-08.ec2.internal", status: "Ready", roles: ["worker"], instanceType: "m5.xlarge", zone: "us-east-1c", cpuPercent: 38, memoryPercent: 45, pods: 18, podsCapacity: 58, age: "42d" },
  { id: "node-4", clusterId: "prod-eks-cluster", name: "ip-10-0-2-19.ec2.internal", status: "NotReady", roles: ["worker"], instanceType: "m5.xlarge", zone: "us-east-1c", cpuPercent: 0, memoryPercent: 0, pods: 6, podsCapacity: 58, age: "9d" },

  { id: "node-5", clusterId: "staging-eks-cluster", name: "ip-10-1-1-10.ec2.internal", status: "Ready", roles: ["control-plane", "worker"], instanceType: "t3.large", zone: "us-west-2a", cpuPercent: 18, memoryPercent: 24, pods: 8, podsCapacity: 29, age: "20d" },
  { id: "node-6", clusterId: "staging-eks-cluster", name: "ip-10-1-1-11.ec2.internal", status: "Ready", roles: ["worker"], instanceType: "t3.large", zone: "us-west-2b", cpuPercent: 12, memoryPercent: 19, pods: 5, podsCapacity: 29, age: "20d" },
];

export const NAMESPACES: K8sNamespace[] = [
  { id: "ns-default", clusterId: "prod-eks-cluster", name: "default", status: "Active", pods: 6, age: "76d" },
  { id: "ns-production", clusterId: "prod-eks-cluster", name: "production", status: "Active", pods: 32, age: "76d" },
  { id: "ns-monitoring", clusterId: "prod-eks-cluster", name: "monitoring", status: "Active", pods: 9, age: "76d" },
  { id: "ns-ci", clusterId: "prod-eks-cluster", name: "ci", status: "Active", pods: 5, age: "60d" },
  { id: "ns-kube-system", clusterId: "prod-eks-cluster", name: "kube-system", status: "Active", pods: 20, age: "76d" },

  { id: "ns-staging-default", clusterId: "staging-eks-cluster", name: "default", status: "Active", pods: 3, age: "20d" },
  { id: "ns-staging", clusterId: "staging-eks-cluster", name: "staging", status: "Active", pods: 7, age: "20d" },
  { id: "ns-staging-kube-system", clusterId: "staging-eks-cluster", name: "kube-system", status: "Active", pods: 3, age: "20d" },
];

export const WORKLOADS: K8sWorkload[] = [
  { id: "wl-1", clusterId: "prod-eks-cluster", name: "api-gateway", kind: "Deployment", namespace: "production", image: "ascelios/api-gateway:2.4.1", readyReplicas: 3, desiredReplicas: 3, status: "Running", restarts: 0, age: "12d", cpuPercent: 34, memoryPercent: 41 },
  { id: "wl-2", clusterId: "prod-eks-cluster", name: "worker-queue", kind: "Deployment", namespace: "production", image: "ascelios/worker-queue:1.9.0", readyReplicas: 2, desiredReplicas: 2, status: "Running", restarts: 1, age: "12d", cpuPercent: 58, memoryPercent: 62 },
  { id: "wl-3", clusterId: "prod-eks-cluster", name: "checkout-service", kind: "Deployment", namespace: "production", image: "ascelios/checkout:3.1.2", readyReplicas: 2, desiredReplicas: 3, status: "Degraded", restarts: 12, age: "3d", cpuPercent: 71, memoryPercent: 55, issue: "CrashLoopBackOff on 1/3 pods — payment-webhook connection timeout" },
  { id: "wl-4", clusterId: "prod-eks-cluster", name: "fraud-detector", kind: "Deployment", namespace: "production", image: "ascelios/fraud-detector:2.0.1", readyReplicas: 0, desiredReplicas: 2, status: "Pending", restarts: 0, age: "4m", cpuPercent: 0, memoryPercent: 0, issue: "ImagePullBackOff — ascelios/fraud-detector:2.0.1 not found in registry" },
  { id: "wl-5", clusterId: "prod-eks-cluster", name: "analytics-cache", kind: "StatefulSet", namespace: "production", image: "redis:7.2-alpine", readyReplicas: 3, desiredReplicas: 3, status: "Running", restarts: 0, age: "40d", cpuPercent: 22, memoryPercent: 38 },
  { id: "wl-6", clusterId: "prod-eks-cluster", name: "log-forwarder", kind: "DaemonSet", namespace: "monitoring", image: "fluent/fluent-bit:2.2", readyReplicas: 3, desiredReplicas: 3, status: "Running", restarts: 0, age: "76d", cpuPercent: 12, memoryPercent: 20 },
  { id: "wl-7", clusterId: "prod-eks-cluster", name: "nightly-etl", kind: "CronJob", namespace: "ci", image: "ascelios/etl-runner:1.2.0", readyReplicas: 0, desiredReplicas: 0, status: "Scheduled", restarts: 0, age: "60d", cpuPercent: 0, memoryPercent: 0 },
  { id: "wl-8", clusterId: "prod-eks-cluster", name: "metrics-server", kind: "Deployment", namespace: "kube-system", image: "k8s.gcr.io/metrics-server:0.7.0", readyReplicas: 1, desiredReplicas: 1, status: "Running", restarts: 0, age: "76d", cpuPercent: 8, memoryPercent: 15 },

  { id: "wl-9", clusterId: "staging-eks-cluster", name: "staging-api", kind: "Deployment", namespace: "staging", image: "ascelios/api-gateway:2.5.0-rc1", readyReplicas: 2, desiredReplicas: 2, status: "Running", restarts: 0, age: "5d", cpuPercent: 18, memoryPercent: 22 },
  { id: "wl-10", clusterId: "staging-eks-cluster", name: "staging-worker", kind: "Deployment", namespace: "staging", image: "ascelios/worker-queue:2.0.0-rc1", readyReplicas: 1, desiredReplicas: 1, status: "Running", restarts: 0, age: "5d", cpuPercent: 9, memoryPercent: 14 },
];

export const PODS: K8sPod[] = [
  { id: "pod-1a", workloadId: "wl-1", name: "api-gateway-7f9c8d-abcde", status: "Running", node: "ip-10-0-1-45.ec2.internal", restarts: 0, age: "12d", cpuPercent: 32, memoryPercent: 40 },
  { id: "pod-1b", workloadId: "wl-1", name: "api-gateway-7f9c8d-fghij", status: "Running", node: "ip-10-0-2-08.ec2.internal", restarts: 0, age: "12d", cpuPercent: 35, memoryPercent: 42 },
  { id: "pod-1c", workloadId: "wl-1", name: "api-gateway-7f9c8d-klmno", status: "Running", node: "ip-10-0-1-12.ec2.internal", restarts: 0, age: "12d", cpuPercent: 34, memoryPercent: 41 },

  { id: "pod-2a", workloadId: "wl-2", name: "worker-queue-6b7d9f-pqrst", status: "Running", node: "ip-10-0-1-45.ec2.internal", restarts: 1, age: "12d", cpuPercent: 60, memoryPercent: 64 },
  { id: "pod-2b", workloadId: "wl-2", name: "worker-queue-6b7d9f-uvwxy", status: "Running", node: "ip-10-0-2-08.ec2.internal", restarts: 0, age: "12d", cpuPercent: 56, memoryPercent: 60 },

  { id: "pod-3a", workloadId: "wl-3", name: "checkout-service-5c8f7b-11aaa", status: "Running", node: "ip-10-0-1-45.ec2.internal", restarts: 0, age: "3d", cpuPercent: 68, memoryPercent: 53 },
  { id: "pod-3b", workloadId: "wl-3", name: "checkout-service-5c8f7b-22bbb", status: "Running", node: "ip-10-0-2-08.ec2.internal", restarts: 1, age: "3d", cpuPercent: 70, memoryPercent: 54 },
  { id: "pod-3c", workloadId: "wl-3", name: "checkout-service-5c8f7b-33ccc", status: "CrashLoopBackOff", node: "ip-10-0-1-12.ec2.internal", restarts: 11, age: "18m", cpuPercent: 4, memoryPercent: 12 },

  { id: "pod-4a", workloadId: "wl-4", name: "fraud-detector-9d4e2a-44ddd", status: "ImagePullBackOff", node: "ip-10-0-1-45.ec2.internal", restarts: 0, age: "4m", cpuPercent: 0, memoryPercent: 0 },
  { id: "pod-4b", workloadId: "wl-4", name: "fraud-detector-9d4e2a-55eee", status: "ImagePullBackOff", node: "ip-10-0-2-08.ec2.internal", restarts: 0, age: "4m", cpuPercent: 0, memoryPercent: 0 },

  { id: "pod-5a", workloadId: "wl-5", name: "analytics-cache-0", status: "Running", node: "ip-10-0-1-12.ec2.internal", restarts: 0, age: "40d", cpuPercent: 20, memoryPercent: 36 },
  { id: "pod-5b", workloadId: "wl-5", name: "analytics-cache-1", status: "Running", node: "ip-10-0-1-45.ec2.internal", restarts: 0, age: "40d", cpuPercent: 23, memoryPercent: 39 },
  { id: "pod-5c", workloadId: "wl-5", name: "analytics-cache-2", status: "Running", node: "ip-10-0-2-08.ec2.internal", restarts: 0, age: "40d", cpuPercent: 22, memoryPercent: 38 },

  { id: "pod-6a", workloadId: "wl-6", name: "log-forwarder-2xk9p", status: "Running", node: "ip-10-0-1-12.ec2.internal", restarts: 0, age: "76d", cpuPercent: 11, memoryPercent: 19 },
  { id: "pod-6b", workloadId: "wl-6", name: "log-forwarder-9mv4q", status: "Running", node: "ip-10-0-1-45.ec2.internal", restarts: 0, age: "76d", cpuPercent: 13, memoryPercent: 21 },
  { id: "pod-6c", workloadId: "wl-6", name: "log-forwarder-7hb2r", status: "Running", node: "ip-10-0-2-08.ec2.internal", restarts: 0, age: "76d", cpuPercent: 12, memoryPercent: 20 },

  { id: "pod-8a", workloadId: "wl-8", name: "metrics-server-4f6c8d-zzzzz", status: "Running", node: "ip-10-0-1-12.ec2.internal", restarts: 0, age: "76d", cpuPercent: 8, memoryPercent: 15 },

  { id: "pod-9a", workloadId: "wl-9", name: "staging-api-8a1b2c-aaaaa", status: "Running", node: "ip-10-1-1-10.ec2.internal", restarts: 0, age: "5d", cpuPercent: 17, memoryPercent: 21 },
  { id: "pod-9b", workloadId: "wl-9", name: "staging-api-8a1b2c-bbbbb", status: "Running", node: "ip-10-1-1-11.ec2.internal", restarts: 0, age: "5d", cpuPercent: 19, memoryPercent: 23 },
  { id: "pod-10a", workloadId: "wl-10", name: "staging-worker-3f4e5d-ccccc", status: "Running", node: "ip-10-1-1-10.ec2.internal", restarts: 0, age: "5d", cpuPercent: 9, memoryPercent: 14 },
];

export const EVENTS: K8sEvent[] = [
  { id: "ev-3a", workloadId: "wl-3", type: "Warning", reason: "BackOff", message: "Back-off restarting failed container checkout in pod checkout-service-5c8f7b-33ccc", count: 14, lastSeen: "2m ago" },
  { id: "ev-3b", workloadId: "wl-3", type: "Warning", reason: "Unhealthy", message: "Readiness probe failed: HTTP probe failed with statuscode 503 (payment-webhook timeout)", count: 9, lastSeen: "3m ago" },
  { id: "ev-3c", workloadId: "wl-3", type: "Normal", reason: "Pulled", message: "Container image \"ascelios/checkout:3.1.2\" already present on machine", count: 3, lastSeen: "18m ago" },

  { id: "ev-4a", workloadId: "wl-4", type: "Warning", reason: "Failed", message: "Failed to pull image \"ascelios/fraud-detector:2.0.1\": not found", count: 6, lastSeen: "1m ago" },
  { id: "ev-4b", workloadId: "wl-4", type: "Warning", reason: "BackOff", message: "Back-off pulling image \"ascelios/fraud-detector:2.0.1\"", count: 6, lastSeen: "1m ago" },
];

const DEFAULT_EVENTS = (w: K8sWorkload): K8sEvent[] => [
  { id: `${w.id}-ev-sched`, workloadId: w.id, type: "Normal", reason: "Scheduled", message: `Successfully assigned ${w.namespace}/${w.name} to a node`, count: 1, lastSeen: `${w.age} ago` },
  { id: `${w.id}-ev-pulled`, workloadId: w.id, type: "Normal", reason: "Pulled", message: `Container image "${w.image}" already present on machine`, count: 1, lastSeen: `${w.age} ago` },
  { id: `${w.id}-ev-started`, workloadId: w.id, type: "Normal", reason: "Started", message: "Started container", count: 1, lastSeen: `${w.age} ago` },
];

export function eventsForWorkload(workload: K8sWorkload): K8sEvent[] {
  const explicit = EVENTS.filter((e) => e.workloadId === workload.id);
  return explicit.length > 0 ? explicit : DEFAULT_EVENTS(workload);
}

export function podsForWorkload(workloadId: string): K8sPod[] {
  return PODS.filter((p) => p.workloadId === workloadId);
}

export function logsForWorkload(workload: K8sWorkload): string[] {
  if (workload.id === "wl-3") {
    return [
      "2026-05-16T09:41:02Z INFO  starting checkout-service v3.1.2",
      "2026-05-16T09:41:03Z INFO  connected to postgres://analytics-postgres:5432",
      "2026-05-16T09:41:14Z WARN  payment-webhook: connect timeout after 5000ms (attempt 1/3)",
      "2026-05-16T09:41:24Z WARN  payment-webhook: connect timeout after 5000ms (attempt 2/3)",
      "2026-05-16T09:41:34Z ERROR payment-webhook: connect timeout after 5000ms (attempt 3/3) — giving up",
      "2026-05-16T09:41:34Z ERROR unhandled rejection: PaymentWebhookTimeoutError",
      "2026-05-16T09:41:35Z INFO  readiness probe failing, marking pod unready",
      "2026-05-16T09:41:50Z INFO  container exited with code 1, restarting (backoff 10s)",
    ];
  }
  if (workload.id === "wl-4") {
    return [
      "2026-05-19T14:02:00Z INFO  pulling image ascelios/fraud-detector:2.0.1",
      "2026-05-19T14:02:03Z ERROR manifest for ascelios/fraud-detector:2.0.1 not found: manifest unknown",
      "2026-05-19T14:02:03Z ERROR failed to pull image, backing off (10s)",
    ];
  }
  return [
    `2026-05-14T08:00:00Z INFO  starting ${workload.name} (${workload.image})`,
    "2026-05-14T08:00:01Z INFO  config loaded from /etc/config",
    "2026-05-14T08:00:02Z INFO  listening on :8080",
    "2026-05-14T08:00:05Z INFO  readiness probe passed",
    "2026-05-14T08:05:00Z INFO  handled 1,204 requests, p95 latency 42ms",
  ];
}

export function yamlForWorkload(workload: K8sWorkload): string {
  return `apiVersion: apps/v1
kind: ${workload.kind}
metadata:
  name: ${workload.name}
  namespace: ${workload.namespace}
  labels:
    app: ${workload.name}
spec:
  replicas: ${workload.desiredReplicas}
  selector:
    matchLabels:
      app: ${workload.name}
  template:
    metadata:
      labels:
        app: ${workload.name}
    spec:
      containers:
        - name: ${workload.name}
          image: ${workload.image}
          ports:
            - containerPort: 8080
          resources:
            requests:
              cpu: "250m"
              memory: "256Mi"
            limits:
              cpu: "500m"
              memory: "512Mi"
          readinessProbe:
            httpGet:
              path: /healthz
              port: 8080
            initialDelaySeconds: 5
`;
}

/* ── Per-cluster accessors ───────────────────────────────── */

export function nodesForCluster(clusterId: string): K8sNode[] {
  return NODES.filter((n) => n.clusterId === clusterId);
}

export function workloadsForCluster(clusterId: string): K8sWorkload[] {
  return WORKLOADS.filter((w) => w.clusterId === clusterId);
}

export function namespacesForCluster(clusterId: string): K8sNamespace[] {
  return NAMESPACES.filter((n) => n.clusterId === clusterId);
}

export function clusterStats(clusterId: string) {
  const nodes = nodesForCluster(clusterId);
  const nodesReady = nodes.filter((n) => n.status === "Ready").length;
  const podsRunning = nodes.reduce((sum, n) => sum + n.pods, 0);
  const podsCapacity = nodes.reduce((sum, n) => sum + n.podsCapacity, 0);
  const avgCpu = Math.round(nodes.reduce((sum, n) => sum + n.cpuPercent, 0) / nodes.length);
  const avgMemory = Math.round(nodes.reduce((sum, n) => sum + n.memoryPercent, 0) / nodes.length);
  return {
    nodesReady,
    nodesTotal: nodes.length,
    podsRunning,
    podsCapacity,
    namespaces: namespacesForCluster(clusterId).length,
    avgCpu,
    avgMemory,
  };
}

export function workloadsWithIssues(clusterId?: string): K8sWorkload[] {
  return WORKLOADS.filter(
    (w) => (w.status === "Degraded" || w.status === "Pending") && (!clusterId || w.clusterId === clusterId),
  );
}

export function clusterHealth(clusterId: string): "Healthy" | "Degraded" {
  const hasNodeIssue = nodesForCluster(clusterId).some((n) => n.status !== "Ready");
  const hasWorkloadIssue = workloadsWithIssues(clusterId).length > 0;
  return hasNodeIssue || hasWorkloadIssue ? "Degraded" : "Healthy";
}

export interface ClusterOverview extends ClusterMeta {
  health: "Healthy" | "Degraded";
  nodesReady: number;
  nodesTotal: number;
  podsRunning: number;
  podsTotal: number;
  cpuPercent: number;
  memoryPercent: number;
}

export function clustersOverview(): ClusterOverview[] {
  return CLUSTERS.map((c) => {
    const s = clusterStats(c.id);
    return {
      ...c,
      health: clusterHealth(c.id),
      nodesReady: s.nodesReady,
      nodesTotal: s.nodesTotal,
      podsRunning: s.podsRunning,
      podsTotal: s.podsCapacity,
      cpuPercent: s.avgCpu,
      memoryPercent: s.avgMemory,
    };
  });
}

/* ── Fleet-wide issues (surfaced regardless of which cluster they're in) ── */

export interface FleetIssue {
  id: string;
  severity: "critical" | "warning";
  title: string;
  context: string;
  ago: string;
  clusterId: string;
  workloadId?: string;
}

export function fleetIssues(): FleetIssue[] {
  const issues: FleetIssue[] = [];

  for (const n of NODES) {
    const cluster = getCluster(n.clusterId);
    if (n.status !== "Ready") {
      issues.push({
        id: `node-${n.id}`,
        severity: "critical",
        title: "Node not ready",
        context: `${cluster?.name} / ${n.name} · ${n.pods} pods affected`,
        ago: "4m ago",
        clusterId: n.clusterId,
      });
    } else if (n.memoryPercent >= 80) {
      issues.push({
        id: `mem-${n.id}`,
        severity: "warning",
        title: "Memory pressure rising",
        context: `${cluster?.name} · ${n.memoryPercent}% used`,
        ago: "18m ago",
        clusterId: n.clusterId,
      });
    }
  }

  for (const w of WORKLOADS) {
    if (w.status !== "Degraded" && w.status !== "Pending") continue;
    const cluster = getCluster(w.clusterId);
    issues.push({
      id: `wl-${w.id}`,
      severity: w.status === "Degraded" ? "critical" : "warning",
      title: w.status === "Degraded" ? "Pods repeatedly restarting" : "Workload pending",
      context: `${cluster?.name} / ${w.namespace} · ${w.name}`,
      ago: w.status === "Degraded" ? "12m ago" : "4m ago",
      clusterId: w.clusterId,
      workloadId: w.id,
    });
  }

  return issues;
}

export function fleetStats() {
  const overview = clustersOverview();
  const healthy = overview.filter((c) => c.health === "Healthy").length;
  const issues = fleetIssues();
  return {
    clusters: overview.length,
    healthy,
    degraded: overview.length - healthy,
    nodesReady: overview.reduce((s, c) => s + c.nodesReady, 0),
    nodesTotal: overview.reduce((s, c) => s + c.nodesTotal, 0),
    podsRunning: overview.reduce((s, c) => s + c.podsRunning, 0),
    podsTotal: overview.reduce((s, c) => s + c.podsTotal, 0),
    critical: issues.filter((i) => i.severity === "critical").length,
    warning: issues.filter((i) => i.severity === "warning").length,
    totalIssues: issues.length,
  };
}

/** Deterministic pseudo-random series so re-renders / re-navigations don't jitter trend lines. */
export function seededSeries(seed: string, base: number, points = 24): number[] {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const series: number[] = [];
  for (let i = 0; i < points; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    const jitter = ((h % 21) - 10) * 0.6;
    series.push(Math.max(0, Math.min(100, Math.round(base + jitter))));
  }
  return series;
}

/* ── Service topology: ingress → service → workload → pods, plus
   dependencies between workloads (e.g. checkout-service → analytics-cache) ── */

export interface K8sService {
  id: string;
  clusterId: string;
  namespace: string;
  name: string;
  workloadId: string;
  ports: { from: number; to: number }[];
}

export interface K8sIngress {
  id: string;
  clusterId: string;
  namespace: string;
  name: string;
  path: string;
  serviceId: string;
}

export interface WorkloadDependency {
  id: string;
  fromWorkloadId: string;
  toServiceId: string;
  protocol: string;
  port: number;
}

export const SERVICES: K8sService[] = [
  { id: "svc-api-gateway", clusterId: "prod-eks-cluster", namespace: "production", name: "api-gateway", workloadId: "wl-1", ports: [{ from: 443, to: 8080 }] },
  { id: "svc-worker-queue", clusterId: "prod-eks-cluster", namespace: "production", name: "worker-queue", workloadId: "wl-2", ports: [{ from: 5672, to: 5672 }] },
  { id: "svc-checkout", clusterId: "prod-eks-cluster", namespace: "production", name: "checkout-service", workloadId: "wl-3", ports: [{ from: 443, to: 8080 }] },
  { id: "svc-analytics-cache", clusterId: "prod-eks-cluster", namespace: "production", name: "analytics-cache", workloadId: "wl-5", ports: [{ from: 6379, to: 6379 }] },
  { id: "svc-staging-api", clusterId: "staging-eks-cluster", namespace: "staging", name: "staging-api", workloadId: "wl-9", ports: [{ from: 443, to: 8080 }] },
];

export const INGRESSES: K8sIngress[] = [
  { id: "ing-checkout", clusterId: "prod-eks-cluster", namespace: "production", name: "checkout-ingress", path: "/api", serviceId: "svc-checkout" },
  { id: "ing-api-gateway", clusterId: "prod-eks-cluster", namespace: "production", name: "api-gateway-ingress", path: "/", serviceId: "svc-api-gateway" },
  { id: "ing-staging-api", clusterId: "staging-eks-cluster", namespace: "staging", name: "staging-api-ingress", path: "/", serviceId: "svc-staging-api" },
];

export const DEPENDENCIES: WorkloadDependency[] = [
  { id: "dep-checkout-cache", fromWorkloadId: "wl-3", toServiceId: "svc-analytics-cache", protocol: "TCP", port: 6379 },
];

export function getService(serviceId: string): K8sService | undefined {
  return SERVICES.find((s) => s.id === serviceId);
}

export function getWorkload(workloadId: string): K8sWorkload | undefined {
  return WORKLOADS.find((w) => w.id === workloadId);
}

export function dependenciesForWorkload(workloadId: string): WorkloadDependency[] {
  return DEPENDENCIES.filter((d) => d.fromWorkloadId === workloadId);
}

export interface TopologyApp {
  id: string;
  name: string;
  namespace: string;
  ingress: K8sIngress | undefined;
  service: K8sService;
  workload: K8sWorkload;
}

/** One topology entry per service that fronts a workload — the unit the "Group by: Application" selector switches between. */
export function topologyAppsForCluster(clusterId: string): TopologyApp[] {
  return SERVICES.filter((s) => s.clusterId === clusterId)
    .map((s) => {
      const workload = getWorkload(s.workloadId);
      if (!workload) return null;
      return {
        id: s.id,
        name: workload.name,
        namespace: s.namespace,
        service: s,
        workload,
        ingress: INGRESSES.find((i) => i.serviceId === s.id),
      };
    })
    .filter((a): a is TopologyApp => a !== null);
}
