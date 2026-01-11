import Page from "@/components/main/reports/Page";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Reports",
    description: "Reports",
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

export default function Reports() {
    return (
        <Page />
    );
}
