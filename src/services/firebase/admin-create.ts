"use server";

// Local Imports
import { IUser } from "@/models/user";
import { IOrganisation } from "@/models/organisation";
import { firestoreAdmin } from "@/lib/firebase/config-admin";
import { createStripeCustomer } from "../stripe/create";
import { organisationsCol, usersCol } from "@/constants/collections";


export async function createUser({ uid, email }: { uid: string, email: string }): Promise<IUser | void> {
    try {
        // Get the user document reference
        const userRef = firestoreAdmin.collection(usersCol).doc(uid);

        const now = new Date();

        const user: IUser = {
            id: uid,
            email,
            authentication: {
                emailVerified: 'verified',
            },
            metadata: {
                createdAt: now.getTime()
            }
        }


        await userRef.set(user);

        return user;
    } catch (error) {
        console.error('Error creating user in Firestore:', error);
    }
}

export async function createOrganisation({
    name,
    ownerId,
    email
}: {
    name: string;
    ownerId: string;
    email: string;
}): Promise<{ org?: IOrganisation, error?: unknown }> {
    try {
        const orgRef = firestoreAdmin.collection(organisationsCol).doc();
        const stripeCustomerId = await createStripeCustomer({ email })
        
        const now = Date.now();

        const organisation: IOrganisation = {
            id: orgRef.id,
            name,
            ownerId,
            subscription: "free",
            members: 1,
            stripeCustomerId,
            createdAt: now,
        };

        await orgRef.set(organisation);

        const userRef = firestoreAdmin.collection(usersCol).doc(ownerId);

        await userRef.update({
            organisation: {
                id: organisation.id,
                joinedAt: Date.now(),
                role: "owner"
            }
        })

        return { org: organisation };
    } catch (error) {
        console.error("Error creating organisation:", error);
        return { error };
    }
}