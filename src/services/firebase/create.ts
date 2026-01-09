// Local Imports
import { firestore } from "@/lib/firebase/config";
import { IMemberInvite } from "@/models/invite";
import { getInviteCodesPath } from "@/constants/collections";
import { invitesCookieKey } from "@/constants/cookies";
import { getCookie, setCookie } from "@/utils/cookie-handlers";

// External Imports
import { doc, setDoc } from "firebase/firestore";


export async function createMemberInvite({ invite }: { invite: IMemberInvite }): Promise<{ code?: string; error?: string }> {
    try {
        // Use subcollection path: organisations/{organisationId}/invite-codes
        const inviteCodesPath = getInviteCodesPath(invite.orgId!);
        const inviteRef = doc(
            firestore,
            inviteCodesPath,
            invite.id as string
        );

        const inviteData: IMemberInvite = {
            ...invite,
            createdAt: Date.now(),
        };

        await setDoc(inviteRef, inviteData);

        // Update the invites cookie to include the new invite
        const cookieKey = `${invite.orgId}_${invitesCookieKey}`;
        const cached = getCookie(cookieKey);

        let invites: IMemberInvite[] = [];
        if (cached) {
            try {
                invites = JSON.parse(cached);
            } catch {
                // If parsing fails, start with empty array
                invites = [];
            }
        }

        // Add the new invite to the list
        invites.push(inviteData);

        // Cache for 1 hour (same as useOrganisationInvites)
        setCookie(cookieKey, JSON.stringify(invites), { expires: 1 / 24 });

        return { code: invite.id as string };
    } catch (error) {
        return { error: `${error}` };
    }
}