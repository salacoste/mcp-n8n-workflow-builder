# Multi-Instance Examples

Real-world examples and patterns for multi-instance n8n management.

---

## Example 1: Development to Production Pipeline

### Scenario

Develop workflow locally, test in staging, deploy to production.

### Workflow

```
Step 1: Create in Development
User: "Create a workflow called 'Daily Report' in development that runs at 9 AM"

Step 2: Test Locally
User: "Activate workflow in development"
User: "Show recent executions from development"

Step 3: Clone to Staging
User: "Get workflow 'Daily Report' from development"
User: "Create that workflow in staging"

Step 4: QA Testing
User: "Activate workflow in staging"
User: "Monitor executions from staging for 24 hours"

Step 5: Deploy to Production
User: "Get workflow 'Daily Report' from staging"
User: "Create that workflow in production"
User: "Activate workflow in production"

Step 6: Monitor Production
User: "Show production executions for 'Daily Report'"
```

### Benefits

- ✅ Safe testing in isolated environments
- ✅ Gradual rollout
- ✅ Easy rollback (deactivate production)
- ✅ Clear audit trail

---

## Example 2: Team Collaboration

### Scenario

Multiple team members working on different environments.

### Setup

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.company.com",
      "n8n_api_key": "prod_key"
    },
    "staging": {
      "n8n_host": "https://staging.n8n.company.com",
      "n8n_api_key": "staging_key"
    },
    "dev-alice": {
      "n8n_host": "https://dev-alice.n8n.company.com",
      "n8n_api_key": "alice_key"
    },
    "dev-bob": {
      "n8n_host": "https://dev-bob.n8n.company.com",
      "n8n_api_key": "bob_key"
    }
  },
  "defaultEnv": "dev-alice"
}
```

### Usage

**Alice (Developer):**
```
List workflows in dev-alice
Create workflow in dev-alice
Test in dev-alice
Push to staging when ready
```

**Bob (Developer):**
```
List workflows in dev-bob
Create workflow in dev-bob
Test in dev-bob
Push to staging when ready
```

**QA Team:**
```
List workflows in staging
Test all staging workflows
Approve for production
```

**Ops Team:**
```
List workflows in production
Monitor executions in production
Manage production deployments
```

---

## Example 3: Geographic Load Balancing

### Scenario

Distribute workflows across regions for performance.

### Configuration

```json
{
  "environments": {
    "us-east": {
      "n8n_host": "https://n8n-us.example.com",
      "n8n_api_key": "us_key"
    },
    "eu-west": {
      "n8n_host": "https://n8n-eu.example.com",
      "n8n_api_key": "eu_key"
    },
    "asia": {
      "n8n_host": "https://n8n-asia.example.com",
      "n8n_api_key": "asia_key"
    }
  },
  "defaultEnv": "us-east"
}
```

### Workflow Distribution

```
US Customers:
→ Create workflows in us-east
→ Lower latency for US users

EU Customers:
→ Create workflows in eu-west
→ GDPR compliance + performance

Asian Customers:
→ Create workflows in asia
→ Reduced latency
```

---

## Example 4: Blue-Green Deployment

### Scenario

Zero-downtime workflow updates using two production instances.

### Configuration

```json
{
  "environments": {
    "production-blue": {
      "n8n_host": "https://blue.n8n.example.com",
      "n8n_api_key": "blue_key"
    },
    "production-green": {
      "n8n_host": "https://green.n8n.example.com",
      "n8n_api_key": "green_key"
    },
    "staging": {
      "n8n_host": "https://staging.n8n.example.com",
      "n8n_api_key": "staging_key"
    }
  },
  "defaultEnv": "production-blue"
}
```

### Deployment Process

```
Current: Blue is live (active workflows)
Goal: Deploy new version to Green, then switch

Step 1: Deploy to Green
→ "Create workflows in production-green"
→ "Activate workflows in production-green"

Step 2: Validate Green
→ "Monitor executions from production-green"
→ Ensure no errors

Step 3: Switch Traffic
→ Update load balancer or DNS
→ Green becomes primary

Step 4: Deactivate Blue
→ "Deactivate all workflows in production-blue"
→ Keep as backup

Step 5: Next Deployment
→ Deploy to Blue (now idle)
→ Switch back to Blue
```

---

## Example 5: Feature Flag Testing

### Scenario

Test new workflow features with percentage rollout.

### Configuration

```json
{
  "environments": {
    "production": {
      "n8n_host": "https://prod.n8n.example.com",
      "n8n_api_key": "prod_key"
    },
    "production-beta": {
      "n8n_host": "https://beta.n8n.example.com",
      "n8n_api_key": "beta_key"
    }
  },
  "defaultEnv": "production"
}
```

### Rollout Strategy

```
Phase 1: 10% Traffic
→ Create workflow in production-beta
→ Route 10% of triggers to beta
→ Monitor error rates

Phase 2: 50% Traffic
→ If stable, increase to 50%
→ Compare metrics: beta vs production

Phase 3: 100% Migration
→ Clone workflow to production
→ Deactivate production-beta version
→ Full rollout complete
```

---

## Example 6: Disaster Recovery

### Scenario

Quick failover to backup instance on primary failure.

### Configuration

```json
{
  "environments": {
    "production-primary": {
      "n8n_host": "https://n8n-primary.example.com",
      "n8n_api_key": "primary_key"
    },
    "production-backup": {
      "n8n_host": "https://n8n-backup.example.com",
      "n8n_api_key": "backup_key"
    }
  },
  "defaultEnv": "production-primary"
}
```

### Failover Process

```
Detection: Primary instance down
→ "List workflows from production-primary"
→ Error: Connection refused

Activation: Failover to backup
→ "List workflows from production-backup"
→ Verify workflows exist (replicated)
→ "Activate all workflows in production-backup"

Recovery: Restore primary
→ Wait for primary recovery
→ Sync workflows from backup to primary
→ Switch back to primary
→ "Deactivate workflows in production-backup"
```

---

## Best Practices

### Environment Organization

!!! tip "Naming Conventions"
    **Environments:**
    - `production` - Live system
    - `staging` - Pre-production
    - `development` - Local dev
    - `qa` - QA testing
    - `demo` - Customer demos

    **Geographic:**
    - `us-east`, `us-west`
    - `eu-central`, `eu-west`
    - `asia-pacific`

### Workflow Promotion

!!! tip "Safe Promotion"
    ```
    1. Create in development
    2. Test thoroughly
    3. Clone to staging
    4. QA validation
    5. Clone to production
    6. Gradual activation
    7. Monitor closely
    ```

### Configuration Management

!!! tip "Config Organization"
    **Separate Configs:**
    - `.config.dev.json` - Development team
    - `.config.qa.json` - QA team
    - `.config.ops.json` - Operations team

    **Load Appropriate Config:**
    ```bash
    cp .config.ops.json .config.json
    ```

### Monitoring

!!! tip "Multi-Instance Monitoring"
    ```
    Daily: Check all instances for failures
    Weekly: Compare execution metrics
    Monthly: Sync workflows across instances
    ```

---

## Common Patterns

### Pattern 1: Environment Parity

Keep staging identical to production:

```
1. List workflows in production
2. For each workflow:
   - Get workflow from production
   - Create/update in staging
3. Result: Staging mirrors production
```

### Pattern 2: Selective Deployment

Deploy specific workflows only:

```
1. Tag workflows for deployment
   → "Add tag 'deploy-next' to workflow 15"
2. List workflows with tag
   → "List workflows tagged 'deploy-next' in staging"
3. Clone to production
   → For each workflow in list, clone to production
```

### Pattern 3: Canary Testing

Test with subset of traffic:

```
1. Create workflow in production-canary
2. Route 5% traffic to canary
3. Monitor for 24 hours
4. If stable, deploy to production-main
5. If issues, deactivate canary
```

---

## Next Steps

- [Configuration Guide](configuration.md) - Setup instructions
- [Environment Manager](environment-manager.md) - Technical details
- [Instance Routing](instance-routing.md) - Routing mechanics
- [API Reference](../api/overview.md) - Tool specifications

---

!!! success "Multi-Instance Patterns"
    These patterns enable professional workflow management with safety, scalability, and team collaboration.
