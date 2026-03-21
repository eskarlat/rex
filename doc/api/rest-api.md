# REST API

The RenreKit dashboard server exposes a REST API that the UI consumes. You can also call these endpoints directly for automation or custom integrations.

## Base URL

```
http://localhost:4200/api
```

## Authentication

All requests must include the project path header:

```
X-RenreKit-Project: /path/to/your/project
```

When LAN mode is active, you also need the PIN:

```
X-RenreKit-Pin: 7392
```

---

## Projects

### `GET /api/projects`

List all registered projects.

```bash
curl http://localhost:4200/api/projects
```

```json
[
  {
    "id": 1,
    "name": "my-project",
    "path": "/Users/me/my-project",
    "created_at": "2026-03-15T10:00:00.000Z"
  }
]
```

### `POST /api/projects`

Register a new project.

```bash
curl -X POST http://localhost:4200/api/projects \
  -H "Content-Type: application/json" \
  -d '{ "path": "/Users/me/new-project" }'
```

### `DELETE /api/projects/:id`

Unregister a project.

```bash
curl -X DELETE http://localhost:4200/api/projects/1
```

---

## Extensions

### `GET /api/extensions`

List extensions for the current project.

```bash
curl http://localhost:4200/api/extensions \
  -H "X-RenreKit-Project: /Users/me/my-project"
```

### `POST /api/extensions/install`

Install an extension from a registry.

```bash
curl -X POST http://localhost:4200/api/extensions/install \
  -H "Content-Type: application/json" \
  -d '{ "name": "hello-world" }'
```

### `DELETE /api/extensions/:name`

Uninstall an extension.

```bash
curl -X DELETE http://localhost:4200/api/extensions/hello-world
```

### `POST /api/extensions/:name/activate`

Activate an extension for the current project.

```bash
curl -X POST http://localhost:4200/api/extensions/hello-world/activate \
  -H "X-RenreKit-Project: /Users/me/my-project"
```

### `POST /api/extensions/:name/deactivate`

Deactivate an extension.

```bash
curl -X POST http://localhost:4200/api/extensions/hello-world/deactivate \
  -H "X-RenreKit-Project: /Users/me/my-project"
```

### `GET /api/extensions/:name/status`

Get extension health status.

```bash
curl http://localhost:4200/api/extensions/github-mcp/status \
  -H "X-RenreKit-Project: /Users/me/my-project"
```

### `GET /api/extensions/:name/config`

Get extension configuration.

### `PUT /api/extensions/:name/config`

Update extension configuration.

```bash
curl -X PUT http://localhost:4200/api/extensions/hello-world/config \
  -H "Content-Type: application/json" \
  -H "X-RenreKit-Project: /Users/me/my-project" \
  -d '{ "companyName": "Acme Corp" }'
```

---

## Commands

### `POST /api/commands/execute`

Execute an extension command.

```bash
curl -X POST http://localhost:4200/api/commands/execute \
  -H "Content-Type: application/json" \
  -H "X-RenreKit-Project: /Users/me/my-project" \
  -d '{ "extension": "hello-world", "command": "greet", "args": { "name": "Ada" } }'
```

```json
{
  "output": "Hello, Ada! Welcome from RenreKit.",
  "exitCode": 0
}
```

---

## Vault

### `GET /api/vault`

List vault keys (not values).

### `POST /api/vault`

Set a vault secret.

```bash
curl -X POST http://localhost:4200/api/vault \
  -H "Content-Type: application/json" \
  -d '{ "key": "GITHUB_TOKEN", "value": "ghp_abc123" }'
```

### `DELETE /api/vault/:key`

Remove a vault secret.

---

## Registries

### `GET /api/registries`

List configured registries.

### `POST /api/registries`

Add a registry.

### `DELETE /api/registries/:name`

Remove a registry.

### `POST /api/registries/sync`

Sync all registry catalogs.

### `GET /api/registries/search?q=<query>`

Search for extensions across registries.

---

## Scheduler

### `GET /api/scheduler/tasks`

List scheduled tasks.

### `POST /api/scheduler/tasks/:id/trigger`

Trigger a task manually.

### `GET /api/scheduler/tasks/:id/history`

Get execution history for a task.

---

## Dashboard

### `GET /api/dashboard/layout`

Get the current dashboard widget layout.

### `PUT /api/dashboard/layout`

Update the widget layout.

```bash
curl -X PUT http://localhost:4200/api/dashboard/layout \
  -H "Content-Type: application/json" \
  -H "X-RenreKit-Project: /Users/me/my-project" \
  -d '{ "widgets": [{ "id": "hello-world:status-widget", "x": 0, "y": 0, "w": 4, "h": 2 }] }'
```

---

## Settings

### `GET /api/settings`

Get global settings.

### `PUT /api/settings`

Update global settings.

---

## WebSocket

### `ws://localhost:4200/ws/logs`

Real-time log streaming. Connect with a WebSocket client to receive log entries as they happen.

```javascript
const ws = new WebSocket('ws://localhost:4200/ws/logs');
ws.onmessage = (event) => {
  const logEntry = JSON.parse(event.data);
  console.log(logEntry);
};
```
