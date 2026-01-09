import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { retrieveAllConnections } from "@/services/connections/retrieve";

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const connections = await retrieveAllConnections({
            organisationId: session.user.organisation?.id as string,
        });

        return NextResponse.json({ connections });
    } catch (error) {
        console.error("Error fetching connection status:", error);
        return NextResponse.json(
            { error: "Failed to fetch connections" },
            { status: 500 }
        );
    }
}
