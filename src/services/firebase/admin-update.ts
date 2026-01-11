"use server";

// Local Imports
import { memberLimits } from "@/constants/limits";
import { IOrganisation } from "@/models/organisation";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import type { IMemberInvite } from "@/models/invite";
import type { IUserOrganisation } from "@/models/user";
import { organisationsCol, usersCol } from "@/constants/collections";

// External Imports
import { FieldValue } from "firebase-admin/firestore";


export async function joinOrganisationAdmin({ code, uid, firstname, lastname }: { code: string; uid: string; firstname?: string; lastname?: string }): Promise<{ success?: boolean, orgId?: string, error?: string }> {
    try {
        // Step 1: Fetch invite using collection group query
        // First, try to find the invite across all organisations using the document ID
        const inviteCollectionGroupQuery = await firestoreAdmin
            .collectionGroup('invite-codes')
            .get();

        // Find the invite document that matches the code (document ID)
        const inviteDoc = inviteCollectionGroupQuery.docs.find(doc => doc.id === code);

        if (!inviteDoc) {
            throw new Error("Invalid invite code");
        }

        const inviteRef = inviteDoc.ref;
        const inviteSnap = inviteDoc;

        // Step 2: Check remaining uses
        const invite = inviteSnap.data() as IMemberInvite;
        if (invite.usesLeft != null && invite.usesLeft <= 0) {
            throw new Error("This invite has expired");
        }

        // Step 3: Retrieve Organisation
        const orgId = invite.orgId!;
        const orgRef = firestoreAdmin.collection(organisationsCol).doc(orgId);
        const orgSnap = await orgRef.get();
        if (!orgSnap.exists) throw new Error("Organisation not found");
        const organisation = orgSnap.data() as IOrganisation;

        // Step 4: Check if hit members limit (unless unlimited)
        const subscriptionTier = organisation?.subscription ?? "free";
        const memberLimit = memberLimits[subscriptionTier as keyof typeof memberLimits];
        const currentMembers = organisation?.members ?? 0;
        if (memberLimit >= 0 && currentMembers >= memberLimit) {
            throw new Error(`Organisation member limit of ${memberLimit} reached`);
        }

        // Step 5: Decrement or delete the invite count
        if (invite.usesLeft == null) {
            // unlimited uses — do nothing
        } else if (invite.usesLeft > 1) {
            await inviteRef.update({ usesLeft: invite.usesLeft - 1 });
        } else {
            await inviteRef.delete();
        }

        // Step 6: Fetch users ref
        const userRef = firestoreAdmin.collection(usersCol).doc(uid);

        // Step 7: Update the user’s organisation sub‑object and remove onboarding
        const orgData: IUserOrganisation = {
            id: invite.orgId ?? null,
            role: invite.role as IUserOrganisation["role"],
            joinedAt: Date.now(),
        };

        const updateData: Record<string, unknown> = {
            organisation: orgData,
            "authentication.onboarding": FieldValue.delete(),
        }
        if (firstname && lastname) {
            updateData.firstname = firstname;
            updateData.lastname = lastname;
        }
        await userRef.update(updateData);

        // Step 8: Increment members count on the organisation document
        await orgRef.update({
            members: FieldValue.increment(1),
        });

        return { success: true, orgId: orgId }
    } catch (error) {
        console.error("joinOrganisationAdmin error:", error);
        return { error: `${error}` }
    }
}