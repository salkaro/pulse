import Layout from "@/components/layout/home-layout";

export default function FeaturesLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <Layout>
            {children}
        </Layout>
    );
}
