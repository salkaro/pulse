import Page from "@/components/main/domains/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Domains",
    description: "Domains",
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

export default function Domains() {
    return (
        <Page />
    );
}
