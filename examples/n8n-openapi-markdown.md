# n8n Public API Documentation

## Information

- **Title**: n8n Public API
- **Description**: n8n Public API
- **Terms of Service**: https://n8n.io/legal/terms
- **Contact**: hello@n8n.io
- **License**: Sustainable Use License (https://github.com/n8n-io/n8n/blob/master/LICENSE.md)
- **Version**: 1.1.1
- **Base URL**: /api/v1

## Authentication

All API endpoints are protected using API key authentication:

```
X-N8N-API-KEY: your-api-key
```

## Tags

- **User**: Operations about users
- **Audit**: Operations about security audit
- **Execution**: Operations about executions
- **Workflow**: Operations about workflows
- **Credential**: Operations about credentials
- **Tags**: Operations about tags
- **SourceControl**: Operations about source control
- **Variables**: Operations about variables
- **Projects**: Operations about projects

## External Documentation

- **Description**: n8n API documentation
- **URL**: https://docs.n8n.io/api/

## Endpoints

### Audit

#### POST /audit

Generate an audit for your n8n instance.

**Request Body**:
```json
{
  "additionalOptions": {
    "daysAbandonedWorkflow": 30,
    "categories": ["credentials", "database", "nodes", "filesystem", "instance"]
  }
}
```

**Responses**:
- **200**: Operation successful. Returns audit information.
- **401**: Unauthorized
- **500**: Internal server error.

### Credentials

#### POST /credentials

Create a credential that can be used by nodes of the specified type.

**Request Body**:
```json
{
  "name": "Joe's Github Credentials",
  "type": "github",
  "data": {
    "token": "ada612vad6fa5df4adf5a5dsf4389adsf76da7s"
  }
}
```

**Responses**:
- **200**: Operation successful.
- **401**: Unauthorized
- **415**: Unsupported media type.

#### DELETE /credentials/{id}

Delete a credential from your instance. You must be the owner of the credentials.

**Path Parameters**:
- **id**: The credential ID that needs to be deleted

**Responses**:
- **200**: Operation successful.
- **401**: Unauthorized
- **404**: Not found

#### GET /credentials/schema/{credentialTypeName}

Show credential data schema for a specific credential type.

**Path Parameters**:
- **credentialTypeName**: The credential type name that you want to get the schema for

**Responses**:
- **200**: Operation successful. Returns schema data.
- **401**: Unauthorized
- **404**: Not found

### Executions

#### GET /executions

Retrieve all executions from your instance.

**Query Parameters**:
- **includeData** (boolean, optional): Whether or not to include the execution's detailed data.
- **status** (string, optional): Status to filter the executions by. Enum: ["error", "success", "waiting"]
- **workflowId** (string, optional): Workflow to filter the executions by.
- **projectId** (string, optional): Project to filter the executions by.
- **limit** (number, optional, default: 100, max: 250): The maximum number of items to return.
- **cursor** (string, optional): Pagination cursor.

**Responses**:
- **200**: Operation successful. Returns execution list.
- **401**: Unauthorized
- **404**: Not found

#### GET /executions/{id}

Retrieve a specific execution from your instance.

**Path Parameters**:
- **id**: The ID of the execution.

**Query Parameters**:
- **includeData** (boolean, optional): Whether or not to include the execution's detailed data.

**Responses**:
- **200**: Operation successful. Returns execution details.
- **401**: Unauthorized
- **404**: Not found

#### DELETE /executions/{id}

Delete an execution from your instance.

**Path Parameters**:
- **id**: The ID of the execution.

**Responses**:
- **200**: Operation successful.
- **401**: Unauthorized
- **404**: Not found

### Tags

#### POST /tags

Create a tag in your instance.

**Request Body**:
```json
{
  "name": "Production"
}
```

**Responses**:
- **201**: Created. Returns the created tag.
- **400**: Bad request
- **401**: Unauthorized
- **409**: Conflict

#### GET /tags

Retrieve all tags from your instance.

**Query Parameters**:
- **limit** (number, optional, default: 100, max: 250): The maximum number of items to return.
- **cursor** (string, optional): Pagination cursor.

**Responses**:
- **200**: Operation successful. Returns tag list.
- **401**: Unauthorized

#### GET /tags/{id}

Retrieve a specific tag.

**Path Parameters**:
- **id**: The ID of the tag.

**Responses**:
- **200**: Operation successful. Returns tag details.
- **401**: Unauthorized
- **404**: Not found

#### DELETE /tags/{id}

Delete a tag.

**Path Parameters**:
- **id**: The ID of the tag.

**Responses**:
- **200**: Operation successful.
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found

#### PUT /tags/{id}

Update a tag.

**Path Parameters**:
- **id**: The ID of the tag.

**Request Body**:
```json
{
  "name": "Updated Tag Name"
}
```

**Responses**:
- **200**: Operation successful. Returns updated tag.
- **400**: Bad request
- **401**: Unauthorized
- **404**: Not found
- **409**: Conflict

### Workflows

#### POST /workflows

Create a workflow in your instance.

**Request Body**: Workflow object with nodes, connections, and settings.

**Responses**:
- **200**: Operation successful. Returns created workflow.
- **400**: Bad request
- **401**: Unauthorized

#### GET /workflows

Retrieve all workflows from your instance.

**Query Parameters**:
- **active** (boolean, optional): Filter by active status.
- **tags** (string, optional): Filter by comma-separated tags.
- **name** (string, optional): Filter by workflow name.
- **projectId** (string, optional): Filter by project ID.
- **excludePinnedData** (boolean, optional): Set to avoid retrieving pinned data.
- **limit** (number, optional, default: 100, max: 250): The maximum number of items to return.
- **cursor** (string, optional): Pagination cursor.

**Responses**:
- **200**: Operation successful. Returns workflow list.
- **401**: Unauthorized

#### GET /workflows/{id}

Retrieve a specific workflow.

**Path Parameters**:
- **id**: The ID of the workflow.

**Query Parameters**:
- **excludePinnedData** (boolean, optional): Set to avoid retrieving pinned data.

**Responses**:
- **200**: Operation successful. Returns workflow details.
- **401**: Unauthorized
- **404**: Not found

#### DELETE /workflows/{id}

Delete a workflow.

**Path Parameters**:
- **id**: The ID of the workflow.

**Responses**:
- **200**: Operation successful.
- **401**: Unauthorized
- **404**: Not found

#### PUT /workflows/{id}

Update a workflow.

**Path Parameters**:
- **id**: The ID of the workflow.

**Request Body**: Updated workflow object.

**Responses**:
- **200**: Operation successful. Returns updated workflow.
- **400**: Bad request
- **401**: Unauthorized
- **404**: Not found

#### POST /workflows/{id}/activate

Activate a workflow.

**Path Parameters**:
- **id**: The ID of the workflow.

**Responses**:
- **200**: Operation successful. Returns workflow object.
- **401**: Unauthorized
- **404**: Not found

#### POST /workflows/{id}/deactivate

Deactivate a workflow.

**Path Parameters**:
- **id**: The ID of the workflow.

**Responses**:
- **200**: Operation successful. Returns workflow object.
- **401**: Unauthorized
- **404**: Not found

#### PUT /workflows/{id}/transfer

Transfer a workflow to another project.

**Path Parameters**:
- **id**: The ID of the workflow.

**Request Body**:
```json
{
  "destinationProjectId": "project-id-here"
}
```

**Responses**:
- **200**: Operation successful.
- **400**: Bad request
- **401**: Unauthorized
- **404**: Not found

#### PUT /credentials/{id}/transfer

Transfer a credential to another project.

**Path Parameters**:
- **id**: The ID of the credential.

**Request Body**:
```json
{
  "destinationProjectId": "project-id-here"
}
```

**Responses**:
- **200**: Operation successful.
- **400**: Bad request
- **401**: Unauthorized
- **404**: Not found

#### GET /workflows/{id}/tags

Get workflow tags.

**Path Parameters**:
- **id**: The ID of the workflow.

**Responses**:
- **200**: Operation successful. Returns list of tags.
- **400**: Bad request
- **401**: Unauthorized
- **404**: Not found

#### PUT /workflows/{id}/tags

Update tags of a workflow.

**Path Parameters**:
- **id**: The ID of the workflow.

**Request Body**: Array of tag IDs.

**Responses**:
- **200**: Operation successful. Returns updated list of tags.
- **400**: Bad request
- **401**: Unauthorized
- **404**: Not found

### Users

#### GET /users

Retrieve all users from your instance. Only available for the instance owner.

**Query Parameters**:
- **limit** (number, optional, default: 100, max: 250): The maximum number of items to return.
- **cursor** (string, optional): Pagination cursor.
- **includeRole** (boolean, optional, default: false): Whether to include the user's role.
- **projectId** (string, optional): Filter by project ID.

**Responses**:
- **200**: Operation successful. Returns user list.
- **401**: Unauthorized

#### POST /users

Create one or more users.

**Request Body**:
```json
[
  {
    "email": "user@example.com",
    "role": "global:admin"
  }
]
```

**Responses**:
- **200**: Operation successful. Returns created user details.
- **401**: Unauthorized
- **403**: Forbidden

#### GET /users/{id}

Retrieve a user from your instance. Only available for the instance owner.

**Path Parameters**:
- **id**: The ID or email of the user.

**Query Parameters**:
- **includeRole** (boolean, optional): Whether to include the user's role.

**Responses**:
- **200**: Operation successful. Returns user details.
- **401**: Unauthorized

#### DELETE /users/{id}

Delete a user from your instance.

**Path Parameters**:
- **id**: The ID or email of the user.

**Responses**:
- **204**: Operation successful.
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found

#### PATCH /users/{id}/role

Change a user's global role.

**Path Parameters**:
- **id**: The ID or email of the user.

**Request Body**:
```json
{
  "newRoleName": "global:admin"
}
```

**Responses**:
- **200**: Operation successful.
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found

### Source Control

#### POST /source-control/pull

Pull changes from the remote repository. Requires the Source Control feature to be licensed and connected to a repository.

**Request Body**:
```json
{
  "force": true,
  "variables": {
    "foo": "bar"
  }
}
```

**Responses**:
- **200**: Operation successful. Returns import result.
- **400**: Bad request
- **409**: Conflict

### Variables

#### POST /variables

Create a variable in your instance.

**Request Body**:
```json
{
  "key": "variable-key",
  "value": "test"
}
```

**Responses**:
- **201**: Operation successful.
- **400**: Bad request
- **401**: Unauthorized

#### GET /variables

Retrieve variables from your instance.

**Query Parameters**:
- **limit** (number, optional, default: 100, max: 250): The maximum number of items to return.
- **cursor** (string, optional): Pagination cursor.

**Responses**:
- **200**: Operation successful. Returns variable list.
- **401**: Unauthorized

#### DELETE /variables/{id}

Delete a variable from your instance.

**Path Parameters**:
- **id**: The ID of the variable.

**Responses**:
- **204**: Operation successful.
- **401**: Unauthorized
- **404**: Not found

### Projects

#### POST /projects

Create a project in your instance.

**Request Body**:
```json
{
  "name": "Project Name"
}
```

**Responses**:
- **201**: Operation successful.
- **400**: Bad request
- **401**: Unauthorized

#### GET /projects

Retrieve projects from your instance.

**Query Parameters**:
- **limit** (number, optional, default: 100, max: 250): The maximum number of items to return.
- **cursor** (string, optional): Pagination cursor.

**Responses**:
- **200**: Operation successful. Returns project list.
- **401**: Unauthorized

#### DELETE /projects/{projectId}

Delete a project from your instance.

**Path Parameters**:
- **projectId**: The ID of the project.

**Responses**:
- **204**: Operation successful.
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found

#### PUT /projects/{projectId}

Update a project.

**Request Body**: Updated project object.

**Responses**:
- **204**: Operation successful.
- **400**: Bad request
- **401**: Unauthorized
- **403**: Forbidden
- **404**: Not found

## Data Models

### Audit

Represents a security audit for various aspects of your n8n instance:

- **Credentials Risk Report**: Information about credential security risks
- **Database Risk Report**: Information about database security risks
- **Filesystem Risk Report**: Information about filesystem security risks
- **Nodes Risk Report**: Information about node security risks
- **Instance Risk Report**: Information about instance security risks

### Credential

```json
{
  "id": "R2DjclaysHbqn778",
  "name": "Joe's Github Credentials",
  "type": "github",
  "data": {
    "token": "ada612vad6fa5df4adf5a5dsf4389adsf76da7s"
  },
  "createdAt": "2022-04-29T11:02:29.842Z",
  "updatedAt": "2022-04-29T11:02:29.842Z"
}
```

### Execution

```json
{
  "id": 1000,
  "data": {},
  "finished": true,
  "mode": "manual",
  "retryOf": null,
  "retrySuccessId": 2,
  "startedAt": "2022-04-29T11:02:29.842Z",
  "stoppedAt": "2022-04-29T11:02:35.842Z",
  "workflowId": 1000,
  "waitTill": null,
  "customData": {}
}
```

### Tag

```json
{
  "id": "2tUt1wbLX592XDdX",
  "name": "Production",
  "createdAt": "2022-04-29T11:02:29.842Z",
  "updatedAt": "2022-04-29T11:02:29.842Z"
}
```

### Node

```json
{
  "id": "0f5532f9-36ba-4bef-86c7-30d607400b15",
  "name": "Jira",
  "type": "n8n-nodes-base.Jira",
  "typeVersion": 1,
  "position": [-100, 80],
  "parameters": {},
  "credentials": {
    "jiraSoftwareCloudApi": {
      "id": "35",
      "name": "jiraApi"
    }
  }
}
```

### Workflow

```json
{
  "id": "2tUt1wbLX592XDdX",
  "name": "Workflow 1",
  "active": false,
  "nodes": [
    {
      "id": "0f5532f9-36ba-4bef-86c7-30d607400b15",
      "name": "Jira",
      "type": "n8n-nodes-base.Jira",
      "typeVersion": 1,
      "position": [-100, 80]
    }
  ],
  "connections": {
    "main": [
      {
        "node": "Jira",
        "type": "main",
        "index": 0
      }
    ]
  },
  "settings": {
    "saveExecutionProgress": true,
    "saveManualExecutions": true,
    "saveDataErrorExecution": "all",
    "saveDataSuccessExecution": "all",
    "executionTimeout": 3600,
    "timezone": "America/New_York"
  },
  "tags": [
    {
      "id": "2tUt1wbLX592XDdX",
      "name": "Production"
    }
  ]
}
```

### User

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174000",
  "email": "john.doe@company.com",
  "firstName": "john",
  "lastName": "Doe",
  "isPending": false,
  "createdAt": "2022-04-29T11:02:29.842Z",
  "updatedAt": "2022-04-29T11:02:29.842Z",
  "role": "owner"
}
```

### Variable

```json
{
  "id": "var12345",
  "key": "variable-key",
  "value": "test",
  "type": "string"
}
```

### Project

```json
{
  "id": "proj12345",
  "name": "Project Name",
  "type": "default"
}
```

## Error Handling

All error responses include:

```json
{
  "code": "ERROR_CODE",
  "message": "Error message",
  "description": "Detailed error description"
}
```

## Pagination

Many endpoints support cursor-based pagination:

1. Make the initial request without a cursor parameter
2. Use the `nextCursor` value from the response as the `cursor` parameter for the next request
3. Repeat until `nextCursor` is null, indicating the end of the collection

## Workflow Trigger Nodes

When creating or updating workflows that need to be activated, you must include at least one valid trigger node. n8n version 1.82 requires that workflows have a properly configured trigger to start execution.

### Valid Trigger Node Types

The following node types are recognized by n8n as valid triggers:

1. **Schedule Triggers**:
   - `n8n-nodes-base.scheduleTrigger`: Schedule execution at regular intervals
   - `n8n-nodes-base.cron`: Schedule execution using cron syntax

2. **Webhook Triggers**:
   - `n8n-nodes-base.webhook`: Trigger workflow on HTTP requests
   - `n8n-nodes-base.httpRequest`: Webhook with advanced options

3. **External Service Triggers**:
   - Various service-specific trigger nodes that poll for events

### Example Schedule Trigger Node

```json
{
  "id": "ScheduleTrigger",
  "name": "Schedule Trigger",
  "type": "n8n-nodes-base.scheduleTrigger",
  "parameters": {
    "interval": [
      {
        "field": "unit",
        "value": "seconds"
      },
      {
        "field": "intervalValue",
        "value": 10
      }
    ]
  },
  "typeVersion": 1,
  "position": [0, 0]
}
```

### Example Webhook Trigger Node

```json
{
  "id": "WebhookTrigger",
  "name": "Webhook",
  "type": "n8n-nodes-base.webhook",
  "parameters": {
    "path": "my-webhook-endpoint",
    "httpMethod": "POST",
    "options": {
      "responseMode": "lastNode"
    }
  },
  "typeVersion": 1,
  "position": [0, 0]
}
```

**Note**: The `manualTrigger` node type is not recognized as a valid trigger for workflow activation in n8n API v1.82. Always use one of the supported trigger types listed above.
