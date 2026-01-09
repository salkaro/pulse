import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { deleteConnection } from "@/services/connections/delete";
import { ConnectionType } from "@/models/connection";

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { type } = body as { type: ConnectionType };

        if (!type) {
            return NextResponse.json(
                { error: "Connection type is required" },
                { status: 400 }
            );
        }

        const success = await deleteConnection({
            organisationId: session.user.organisation?.id as string,
            type,
        });

        if (!success) {
            return NextResponse.json(
                { error: "Connection not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error disconnecting:", error);
        return NextResponse.json(
            { error: "Failed to disconnect" },
            { status: 500 }
        );
    }
}
