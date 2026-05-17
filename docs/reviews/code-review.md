# Code Review Guide

Codex must use this guide when reviewing or modifying code.

## Review Priorities

1. Correctness
2. Security
3. Maintainability
4. Testability
5. Performance
6. Consistency with project conventions

## General Checklist

- [ ] Does the code solve the stated task?
- [ ] Is the change minimal and focused?
- [ ] Are edge cases handled?
- [ ] Are errors handled explicitly?
- [ ] Is naming clear?
- [ ] Are responsibilities placed in the correct layer?
- [ ] Are tests added or updated when needed?
- [ ] Is documentation updated?

## Frontend Checklist

- [ ] UI state is clear and predictable.
- [ ] API calls are isolated from presentation logic where possible.
- [ ] Components are not overly coupled.
- [ ] Loading, empty, and error states are handled.

## Backend Checklist

- [ ] Input validation is handled.
- [ ] Business logic is not placed directly in controllers.
- [ ] Error responses are consistent.
- [ ] Persistence logic is separated from business logic.
- [ ] External integrations have timeout/error handling where needed.
- [ ] Tests cover important business behavior.

## Documentation Checklist

- [ ] Task board updated.
- [ ] Work log updated.
- [ ] Architecture decisions recorded when needed.
