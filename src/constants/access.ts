export const levelOneAccess = ["viewer", "member", "developer", "admin", "owner"];
export const levelTwoAccess = ["member", "developer", "admin", "owner"];
export const levelThreeAccess = ["developer", "admin", "owner"];
export const levelFourAccess = ["admin", "owner"];
export const levelFiveAccess = ["owner"];

export type OrgRoleType = typeof levelOneAccess[number]; 
export type OrgRoleColorType = keyof typeof levelsToColors

export const levelsToIndex = {
    "viewer": "0",
    "member": "1",
    "developer": "2",
    "admin": "3",
    "owner": "4",
}

export const levelsToColors = {
    "viewer": "#63B3ED",     
    "member": "#404EC0", 
    "developer": "#712bfb",  
    "admin": "#02bb1b",      
    "owner": "#b402bb",     
}

export const apiTokenAccessLevels = {
    0: "00", // Admin
}

export const apiTokenAccessLevelsName = {
    0: "Admin",
}