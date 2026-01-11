import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { retrieveUserAdmin } from '@/services/firebase/admin-retrieve';
import { createConnection } from '@/services/connections/create';
import { root } from '@/constants/site';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('Google OAuth error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(
          `/connections?error=${encodeURIComponent(errorDescription || error)}`,
          request.url
        )
      );
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/connections?error=Invalid OAuth response', request.url)
      );
    }

    // Verify state parameter
    let stateData: { userId: string; timestamp: number };
    try {
      stateData = JSON.parse(Buffer.from(state, 'base64').toString());
    } catch {
      return NextResponse.redirect(
        new URL('/connections?error=Invalid state parameter', request.url)
      );
    }

    // Check if state is not too old (5 minutes max)
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - stateData.timestamp > fiveMinutes) {
      return NextResponse.redirect(
        new URL('/connections?error=OAuth session expired', request.url)
      );
    }

    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.GOOGLE_OAUTH_REDIRECT_URI;

    if (!googleClientId || !googleClientSecret || !redirectUri) {
      throw new Error('Google OAuth is not configured');
    }

    // Create OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      googleClientId,
      googleClientSecret,
      redirectUri
    );

    // Exchange authorization code for access token
    const { tokens } = await oauth2Client.getToken(code);

    if (!tokens.access_token) {
      throw new Error('Failed to get access token');
    }

    // Set credentials to get user info
    oauth2Client.setCredentials(tokens);

    // Get user's email address
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    // Retrieve the user to get their organisation ID
    const user = await retrieveUserAdmin({ uid: stateData.userId });

    if (!user || !user.organisation?.id) {
      return NextResponse.redirect(
        new URL(
          '/connections?error=User or organisation not found',
          request.url
        )
      );
    }

    // Store the connection in Firebase
    await createConnection({
      organisationId: user.organisation.id,
      type: 'google',
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token || undefined,
      googleEmail: userInfo.data.email || undefined,
      expiresAt: tokens.expiry_date || undefined,
    });

    // Redirect back to connections page with success message
    return NextResponse.redirect(
      new URL(
        `${root}/connections?success=Google Analytics connected successfully`,
        request.url
      )
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL(
        `${root}/connections?error=${encodeURIComponent('Failed to connect Google Analytics account')}`,
        request.url
      )
    );
  }
}
