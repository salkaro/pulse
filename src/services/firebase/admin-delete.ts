"use server"

// Local Imports
import { getInviteCodesPath, organisationsCol, usersCol } from "@/constants/collections";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { retrieveUIDAdmin } from "./admin-retrieve";
import { incrementOrganisationMembersCount } from "./admin-increment";
import { IUser } from "@/models/user";
import { levelThreeAccess } from "@/constants/access";

// External Imports
import { firestore } from "firebase-admin";
import { getAuth } from "firebase-admin/auth";


export async function deleteUserAdmin({ idToken }: { idToken: string }): Promise<{ success?: boolean; error?: string }> {
    try {
        // Step 1: Retrieve UID
        const uid = await retrieveUIDAdmin({ idToken });
        if (!uid) throw Error("User could not be found");

        // Step 2: Delete users documents
        const { error: deleteDocError } = await deleteUserDocsAdmin({ uid, idToken });
        if (deleteDocError) throw deleteDocError;

        // Step 3: Delete users authentication
        const { error: deleteAuthError } = await deleteAuthUserAdmin({ uid });
        if (deleteAuthError) throw deleteAuthError;

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}


async function deleteAuthUserAdmin({ uid }: { uid: string }): Promise<{ success?: boolean; error?: string }> {
    try {
        await getAuth().deleteUser(uid);
        return { success: true };
    } catch (error) {
        console.error(`Failed to delete auth user: ${uid}`, error);
        return { error: (error as Error).message };
    }
}

async function deleteUserDocsAdmin({ uid, idToken, isOwner, orgId }: { uid: string, idToken: string, isOwner?: boolean, orgId?: string }): Promise<{ success?: boolean; error?: unknown }> {
    try {
        // Step 1: Decrement organisation members count if user belongs to an org and is not the owner
        if (orgId && !isOwner) {
            await incrementOrganisationMembersCount({ idToken, orgId, negate: true });
        }

        // Step 2: Retrieve user ref and delete it
        const userDocRef = firestoreAdmin.collection(usersCol).doc(uid);
        await userDocRef.delete();

        if (isOwner && orgId) {
            // Step 3: Remove organisation reference from all users in the organisation
            const usersInOrgQuery = await firestoreAdmin
                .collection(usersCol)
                .where('organisation.id', '==', orgId)
                .get();

            const userBatch = firestore().bulkWriter();
            usersInOrgQuery.docs.forEach((docSnap) => {
                userBatch.update(docSnap.ref, {
                    organisation: firestore.FieldValue.delete()
                });
            });
            await userBatch.close();

            // Step 4: Delete the organisation document
            const organisationDocRef = firestoreAdmin.collection(organisationsCol).doc(orgId);
            await firestore().recursiveDelete(organisationDocRef);

            // Step 5: Delete all invite codes for the organisation (subcollection will be deleted with org)
            // Note: Firestore automatically deletes subcollections when using recursiveDelete
        }

        return { success: true };
    } catch (error) {
        console.error(`Failed to delete user ${uid} data`, error);
        return { error: `${error}` };
    }
}

export async function deleteInviteCodeAdmin({ idToken, inviteId, orgId }: { idToken: string, inviteId: string, orgId: string }): Promise<{ success?: boolean; error?: string }> {
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

        // Step 4: Delete the invite code from subcollection
        const inviteCodesPath = getInviteCodesPath(orgId);
        await firestoreAdmin.collection(inviteCodesPath).doc(inviteId).delete();

        return { success: true };
    } catch (error) {
        console.error(`Error in deleteInviteCodeAdmin: ${error}`);
        return { error: `${error}` }
    }
}
