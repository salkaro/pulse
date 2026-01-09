import { Metadata } from "next";
import NotFoundInfo from "@/components/ui/not-found";

export const metadata: Metadata = {
    title: "404 - Page Not Found | Salkaro Finance",
    description: "The page you're looking for doesn't exist.",
};

export default function NotFound() {
    return (
        <NotFoundInfo />
    );
}
