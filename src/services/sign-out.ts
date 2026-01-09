"use client"

// External Imports
import { signOut as nextSignOut } from "next-auth/react";
import { signOut as firebaseSignout } from "firebase/auth";

// Local Imports
import { removeAllCookies } from "@/utils/cookie-handlers";
import { auth } from "@/lib/firebase/config";

export async function signOut(redirect?: string) {
    removeAllCookies();
    await firebaseSignout(auth);
    await nextSignOut({ callbackUrl: redirect ? redirect : "/", redirect: true })
}