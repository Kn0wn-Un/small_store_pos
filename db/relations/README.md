# Relations Layer

This module keeps `relations()` definitions isolated from table declarations.

Benefits:
- Keeps schema files focused on table DDL.
- Allows strongly typed relation graph queries in Drizzle.
- Makes the architecture easier to scale as more modules are added.
