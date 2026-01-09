import Page from "@/components/main/customers/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Customers",
    description: "Manage your Stripe customers",
    robots: {
        index: false,
        follow: false,
        nocache: false,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: false,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

export default function Customers() {
    return (
        <Page />
    );
}
