# Finding format (mandatory)

```text
[SEVERITY: blocker|major|minor|nit] [RULE-ID if applicable]
Location: file:line
Problem:
Evidence:
Suggestion:
Confidence: high|medium|low
```

- A finding without location **and** evidence is discarded.
- Severity: blocker = must fix before merge · major = fix or justify · minor = should fix · nit = optional.
- Low confidence → phrase it as a question.
