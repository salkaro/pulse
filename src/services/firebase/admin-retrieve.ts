"use server";

// Local Imports
import { IUser } from "@/models/user";
import { IMemberInvite } from "@/models/invite";
import { usersCol, getInviteCodesPath } from "@/constants/collections";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { levelThreeAccess } from "@/constants/access";

// External Imports
import { getAuth } from "firebase-admin/auth";

export async function retrieveUIDAdmin({ idToken }: { idToken: string }) {
    try {
        const decodedToken = await getAuth().verifyIdToken(idToken);
        return decodedToken.uid;
    } catch (error) {
        throw error;
    }
}

export async function retrieveUserAdmin({ uid }: { uid: string }): Promise<IUser | void> {
    try {
        // Step 1: Retrieve document reference & snapshot
        const docRef = firestoreAdmin.collection(usersCol).doc(uid)
        const snapshot = await docRef.get();

        // Step 2: If snapshot exists return snapshot data
        if (snapshot.exists) {
            return snapshot.data() as IUser;
        }
    } catch (error) {
        console.error(`Error in retrieveConnectedAccountAdmin: ${error}`);
    }
}


export async function retrieveOrganisationMembers({ idToken, orgId }: { idToken: string, orgId: string }): Promise<{ members?: IUser[], error?: string }> {
    try {
        // Step 1: Verify token and get caller UID
        const uid = await retrieveUIDAdmin({ idToken });
        if (!uid) {
            return { error: "No user found" }
        };

        // Step 2: Fetch the caller's user document
        const callerSnap = await firestoreAdmin.collection(usersCol).doc(uid).get();
        if (!callerSnap.exists) {
            return { error: "Caller not found in users collection." };
        }
        const caller = callerSnap.data() as IUser;

        // Step 3: Check permission: must belong to orgId with level three perms
        const hasAccess = levelThreeAccess.includes(caller.organisation?.role as string);
        if (
            caller.organisation?.id !== orgId || !hasAccess
        ) {
            return { error: "Insufficient permissions." };
        }

        // Step 4: Query all users in that organisation
        const querySnap = await firestoreAdmin
            .collection(usersCol)
            .where("organisation.id", "==", orgId)
            .get();

        const members: IUser[] = querySnap.docs.map((doc) => doc.data() as IUser);

        return { members };
    } catch (error) {
        console.error(`Error in retrieveOrganisationMembers: ${error}`);
        return { error: `${error}` }
    }
}

export async function retrieveOrganisationInvites({ idToken, orgId }: { idToken: string, orgId: string }): Promise<{ invites?: IMemberInvite[], error?: string }> {
    try {
        // Step 1: Verify token and get caller UID
        const uid = await retrieveUIDAdmin({ idToken });
        if (!uid) {
            return { error: "No user found" }
        };

        // Step 2: Fetch the caller's user document
        const callerSnap = await firestoreAdmin.collection(usersCol).doc(uid).get();
        if (!callerSnap.exists) {
            return { error: "Caller not found in users collection." };
        }
        const caller = callerSnap.data() as IUser;

        // Step 3: Check permission: must belong to orgId with level three perms
        const hasAccess = levelThreeAccess.includes(caller.organisation?.role as string);
        if (
            caller.organisation?.id !== orgId || !hasAccess
        ) {
            return { error: "Insufficient permissions." };
        }

        // Step 4: Query all invite codes for that organisation from subcollection
        const inviteCodesPath = getInviteCodesPath(orgId);
        const querySnap = await firestoreAdmin
            .collection(inviteCodesPath)
            .get();

        const invites: IMemberInvite[] = querySnap.docs.map((doc) => doc.data() as IMemberInvite);

        return { invites };
    } catch (error) {
        console.error(`Error in retrieveOrganisationInvites: ${error}`);
        return { error: `${error}` }
    }
}