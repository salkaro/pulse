// Root Collections
export const usersCol = "users";
export const organisationsCol = "organisations";

// Subcollections (under organisations/{organisationId}/)
export const connectionsSubCol = "connections";
export const inviteCodesSubCol = "invite-codes";
export const entitiesSubCol = "entities";
export const ticketsSubCol = "tickets";
export const tokensSubCol = "tokens";
export const automationsSubCol = "automations";
export const domainsSubCol = "domains";

// Helper functions to get subcollection paths
export const getConnectionsPath = (organisationId: string) =>
    `${organisationsCol}/${organisationId}/${connectionsSubCol}`;

export const getInviteCodesPath = (organisationId: string) =>
    `${organisationsCol}/${organisationId}/${inviteCodesSubCol}`;

export const getEntitiesPath = (organisationId: string) =>
    `${organisationsCol}/${organisationId}/${entitiesSubCol}`;

export const getTicketsPath = (organisationId: string, entityId: string) =>
    `${organisationsCol}/${organisationId}/${entitiesSubCol}/${entityId}/${ticketsSubCol}`;

export const getAutomationsPath = (organisationId: string, entityId: string) =>
    `${organisationsCol}/${organisationId}/${entitiesSubCol}/${entityId}/${automationsSubCol}`;

export const getDomainsPath = (organisationId: string) =>
    `${organisationsCol}/${organisationId}/${domainsSubCol}`;

export const getTokensPath = (organisationId: string) =>
    `${organisationsCol}/${organisationId}/${tokensSubCol}`;

// Legacy alias for backwards compatibility
export const getProductsPath = getEntitiesPath;