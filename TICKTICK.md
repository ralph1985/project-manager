# TickTick integration

This project reads reminders from TickTick using the Open API (read-only).

Offline documentation lives in `docs/ticktick-api/`.

## Environment

- `TICKTICK_ACCESS_TOKEN`: OAuth access token with `tasks:read` scope.

## Vehicle mapping

Each vehicle can be linked to a TickTick project using `Vehicle.ticktickProjectId`.

To find the project IDs, use the internal page:

- `/ticktick/projects`

## Current behavior

- Reads the project linked to each vehicle.
- Sorts reminders by `dueDate` ascending.
- Shows a fallback message when the token is missing or the vehicle lacks a project id.
