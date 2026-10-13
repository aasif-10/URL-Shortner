# AI Agent Guidelines for URL Shortener

## Documentation Standards (GitHub READMEs)

When creating, reviewing, or modifying README files in this repository, strictly adhere to these 5 pillars:

1. **Keep GitHub READMEs Professional and Comprehensive**:
   - Include clear project overview, feature lists, badges, directory hierarchy, and complete API specifications.
   - Maintain production-grade documentation quality with no placeholders or generic boilerplate.

2. **Include Architecture Diagrams**:
   - Provide Mermaid diagrams (`flowchart TD/LR`, `sequenceDiagram`, `erDiagram`) showing system architecture, data flow paths (e.g., cache-aside redirect & asynchronous analytics), and relational schemas.

3. **Document Setup and Run Instructions**:
   - Provide explicit prerequisites, container startup (`docker compose`), dependency management, environment variables configuration, database sync/migrations (`prisma db push`), and execution steps for both backend and frontend.

4. **List All Technologies Used**:
   - Document all tools, libraries, frameworks, and versions across layers (Backend, Frontend, Data Layer, Infrastructure) with their explicit role in the system.

5. **Explain Key Design Decisions**:
   - Document architectural choices, trade-offs, and design rationale (e.g., Redis cache-aside caching, BullMQ asynchronous click tracking, dual-token JWT authentication with hashed refresh tokens, nanoid collision mitigation, database indexing).
