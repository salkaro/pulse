"use client";

// Local Imports
import { IUser } from "@/models/user";
import { userCache } from "@/constants/cache";
import { removeCookie } from "@/utils/cookie-handlers";
import { IOrganisation } from "@/models/organisation";
import { withTokenRefresh } from "@/utils/token-refresh";
import { auth, firestore } from "@/lib/firebase/config";
import { createOrganisation } from "./admin-create";
import { organisationsCol, tokensSubCol, usersCol } from "@/constants/collections";
import { incrementOrganisationMembersCount } from "./admin-increment";

// External Imports
import { deleteDoc, deleteField, doc, FieldValue, setDoc, updateDoc } from "firebase/firestore";
import { IToken } from "@/models/token";
import { OrgRoleType } from "@/constants/access";


export async function updateOnboarding({ firstname, lastname, organisation }: { firstname: string, lastname: string, organisation?: string }) {
    try {
        const user = auth.currentUser;

        if (!user || !user.email) {
            throw new Error("No authenticated user found.");
        }

        const userRef = doc(firestore, usersCol, user.uid);

        const updatePayload: { [x: string]: FieldValue | Partial<unknown> | undefined; } = {
            firstname,
            lastname,
            "authentication.onboarding": deleteField(),
        }

        if (organisation) {
            const { org, error } = await createOrganisation({
                name: organisation,
                ownerId: user.uid,
                email: user.email,
            })

            if (error || !org) throw error

            updatePayload.organisation = {
                id: org.id,
                role: "owner",
                joinedAt: org.createdAt,
            }
        }

        await updateDoc(userRef, updatePayload);
    } catch (error) {
        console.error("Failed to update onboarding info:", error);
        throw error;
    }
}


// Helper function to recursively remove undefined values
function removeUndefined<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    if (Array.isArray(obj)) return obj.map(removeUndefined) as T;
    if (typeof obj === 'object') {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, value]) => value !== undefined)
                .map(([key, value]) => [key, removeUndefined(value)])
        ) as T;
    }
    return obj;
}

export async function updateUser({ user }: { user: IUser }) {
    try {
        const { id, ...updatableFields } = user;

        // Recursively filter out undefined values to avoid Firebase errors
        const cleanedFields = removeUndefined(updatableFields);

        const ref = doc(firestore, usersCol, id as string);
        await updateDoc(ref, cleanedFields);

        // Invalidate user cache since data changed
        removeCookie(userCache);

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}

export async function updateOrganisation({ organisation }: { organisation: IOrganisation }) {
    try {
        const { id, ...updatableFields } = organisation;

        const ref = doc(firestore, organisationsCol, id as string);
        await updateDoc(ref, updatableFields);

        return { success: true };
    } catch (error) {
        return { error: `${error}` };
    }
}

export async function updateOrganisationMember({ member, organisation, remove }: { member: IUser, organisation?: IOrganisation, remove?: boolean }) {
    try {
        const userRef = doc(firestore, usersCol, member.id as string);

        if (remove && organisation && organisation.members) {
            await withTokenRefresh(async (idToken) => {
                await updateDoc(userRef, {
                    organisation: deleteField(),
                });

                await incrementOrganisationMembersCount({ idToken, orgId: organisation.id as string, negate: true });
                return { success: true };
            });
        } else {
            await updateDoc(userRef, {
                'organisation.role': member.organisation?.role,
            });
        }

        return { success: true };
    } catch (error) {
        console.error(`Error in updateOrganisationMember: ${error}`);
        return { error: `${error}` }
    }
}

export async function updateAPIKey({ orgId, token, type, perms, prevId }: { orgId: string, token?: IToken, type: "delete" | "update" | "rotate", perms: OrgRoleType, prevId?: string | null }): Promise<{ success?: boolean, error?: string }> {
    try {
        if (!perms || perms === "viewer") return { error: "Invalid permissions" };

        if (!token || !token.id) {
            return { error: "Missing token or token.id" };
        }

        const tokenRef = doc(firestore, organisationsCol, orgId, tokensSubCol, token.id);

        if (type === "delete") {
            await deleteDoc(tokenRef);
        } else if (type === "update") {
            await setDoc(tokenRef, token, { merge: true });
        } else if (type === "rotate" && prevId) {
            const oldRef = doc(firestore, organisationsCol, orgId, tokensSubCol, prevId);
            await deleteDoc(oldRef);
            await setDoc(tokenRef, token, { merge: true });
        }

        return { success: true }

    } catch (error) {
        return { error: `${error}` }
    }
}