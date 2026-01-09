"use server";

// Local Imports
import { increment } from "firebase/firestore";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { retrieveUIDAdmin } from "./admin-retrieve";
import { levelThreeAccess } from "@/constants/access";
import { organisationsCol, usersCol } from "@/constants/collections";

export async function incrementOrganisationMembersCount({ idToken, orgId, negate }: { idToken: string, orgId: string, negate: boolean }) {
    try {
        // Step 1: Verify token & get UID
        const uid = await retrieveUIDAdmin({ idToken });
        if (!uid) {
            return { error: "Invalid authentication token." };
        }

        // Step 2: Fetch the caller’s user record
        const userSnap = await firestoreAdmin.collection(usersCol).doc(uid).get();
        if (!userSnap.exists) {
            return { error: "Caller does not exist." };
        }
        const caller = userSnap.data();

        // Step 3: Permission check – must be admin or owner of this org
        if (!negate) {
            if (
                caller?.organisation?.id !== orgId ||
                !levelThreeAccess.includes(caller.organisation.role)
            ) {
                return { error: "Insufficient permissions." };
            }
        }

        // Step 4: Atomically increment the membersCount field
        const orgRef = firestoreAdmin.collection(organisationsCol).doc(orgId);
        await orgRef.update({
            members: increment(negate ? -1 : 1),
        });

        return { success: true };
    } catch (err) {
        console.error("Error in incrementOrganisationMembersCount:", err);
        return { error: err instanceof Error ? err.message : "Unknown error" };
    }
}