import Page from "@/components/main/connections/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Connections",
    description: "Connections",
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

export default function Connections() {
    return (
        <Page />
    );
}
