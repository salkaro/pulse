// Local Impoorts
import { IUser } from "@/models/user";
import { createUser } from "./admin-create";
import { IOrganisation } from "@/models/organisation";
import { auth, firestore } from "@/lib/firebase/config";
import { getCookie, setCookie } from "@/utils/cookie-handlers";
import { organisationsCol, tokensSubCol, usersCol } from "@/constants/collections";
import { CACHE_EXPIRY_DAYS, idTokenCache, userCache } from "@/constants/cache";

// External Imports
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { IToken } from "@/models/token";


export async function retrieveIdToken(forceRefresh: boolean = false) {
    try {
        const user = auth.currentUser;
        if (!user) return;

        // If force refresh is requested, skip cache and get fresh token
        if (forceRefresh) {
            const idToken = await user.getIdToken(true);
            if (!idToken) return;

            // Cache the fresh token
            setCookie(idTokenCache, idToken, { expires: CACHE_EXPIRY_DAYS });
            return idToken;
        }

        // Check cache first
        const cachedToken = getCookie(idTokenCache);
        if (cachedToken) {
            return cachedToken;
        }

        // Get token (will use cached token from Firebase SDK if still valid)
        const idToken = await user.getIdToken();
        if (!idToken) return;

        // Cache the token
        setCookie(idTokenCache, idToken, { expires: CACHE_EXPIRY_DAYS });

        return idToken;
    } catch (error) {
        console.error(error)
    }
}

export async function retrieveUserAndCreate({ uid, email }: { uid: string, email?: string | null }): Promise<IUser | void> {
    try {
        // Check cache first
        const cachedUser = getCookie(userCache);
        if (cachedUser) {
            return JSON.parse(cachedUser) as IUser;
        }

        // Step 1: Retrieve document reference
        const docRef = doc(firestore, usersCol, uid);
        const userDoc = await getDoc(docRef);

        // Step 2: Check if the user document exists
        if (userDoc.exists()) {
            // Step 3: Extract & return the user data as an IUser object
            const userData = userDoc.data() as IUser;

            // Cache the user data
            setCookie(userCache, JSON.stringify(userData), { expires: CACHE_EXPIRY_DAYS });

            return userData;
        } else {
            if (!email) throw new Error('Email is required to create a new user');

            // Step 4: Create a new user
            const newUser = await createUser({ uid, email });

            // Cache the newly created user
            if (newUser) {
                setCookie(userCache, JSON.stringify(newUser), { expires: CACHE_EXPIRY_DAYS });
            }

            return newUser;
        }
    } catch (error) {
        console.error('Error retrieving user from Firestore:', error);
    }
}


export async function retrieveUser({ uid }: { uid: string }): Promise<IUser | void> {
    try {
        // Check cache first
        const cachedUser = getCookie(userCache);
        if (cachedUser) {
            return JSON.parse(cachedUser) as IUser;
        }

        // Step 1: Retrieve document reference
        const docRef = doc(firestore, usersCol, uid);
        const userDoc = await getDoc(docRef);

        // Step 2: Check if the user document exists
        if (userDoc.exists()) {
            // Step 3: Extract & return the user data as an IUser object
            const userData = userDoc.data() as IUser;

            // Cache the user data
            setCookie(userCache, JSON.stringify(userData), { expires: CACHE_EXPIRY_DAYS });

            return userData;
        }
    } catch (error) {
        console.error('Error retrieving user from Firestore:', error);
    }
}

export async function retrieveOrganisation({ orgId }: { orgId: string }): Promise<IOrganisation | void> {
    try {
        // Step 1: Retrieve document reference
        const docRef = doc(firestore, organisationsCol, orgId);
        const orgDoc = await getDoc(docRef);

        // Step 2: Check if the organisation document exists
        if (orgDoc.exists()) {
            // Step 3: Extract & return the organisation data
            return orgDoc.data() as IOrganisation;
        }
    } catch (error) {
        console.error('Error retrieving organisation from Firestore:', error);
        throw error;
    }
}


export async function retrieveTokens({ orgId }: { orgId: string }): Promise<IToken[]> {
    try {
        // Step 1: Reference to the tokens subcollection
        const tokensRef = collection(firestore, organisationsCol, orgId, tokensSubCol);

        // Step 2: Fetch all documents
        const snapshot = await getDocs(tokensRef);

        // Step 3: Aggregate token data
        const tokens: IToken[] = snapshot.docs.map(doc => doc.data() as IToken);

        return tokens;
    } catch (error) {
        console.error('Error retrieving tokens from Firestore:', error);
        throw error;
    }
}