client
- build/dist
- node_modules
- public
- src
-- api
-- assets?
-- context (for context files)
-- components
-- data (for reusable data stored as json... and maybe enums too?... also maybe types as well??) - each of these in their own subfolder i.e data/json, data/enums, data/types
-- hooks (this is where the queries will go, maybe in their own folder)
-- layouts (for general components such as side panels and nav bars)
-- modules (for small systems with specific uses such as an error handler)
-- helpers/utils

server
- src
-- data (for reusable data stored as json... and maybe enums too?... also maybe types as well??) - each of these in their own subfolder i.e data/json, data/enums, data/types
-- helpers/utils
-- controllers
-- daos
-- db
-- facades
-- maybe shared for the client to reference?