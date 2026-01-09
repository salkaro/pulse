import { LayoutGrid, LucideProps } from "lucide-react"
import { FaStripeS } from "react-icons/fa"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { forwardRef } from "react"
import { extractInitials } from "@/utils/extract"


export const ProfileImage = ({ className, image, name, email }: { className?: string, image?: string, name?: string, email?: string }) => {
    return (
        <Avatar className={`h-8 w-8 ${className} ${image ? "bg-input" : "border"} rounded-full flex items-center justify-center`}>
            <AvatarImage src={image} alt="PI" className='rounded-md' />
            <AvatarFallback className="text-primary text-sm font-bold bg-background!">
                {extractInitials({ name: name, email: email })}
            </AvatarFallback>
        </Avatar>
    )
}

export const LayoutGridIcon = forwardRef<SVGSVGElement, LucideProps>(
    (props, ref) => (
        <LayoutGrid
            ref={ref}
            {...props}
            className={`rotate-45 ${props.className ?? ""}`}
        />
    )
)

LayoutGridIcon.displayName = "LayoutGridIcon"
export const stripeBrandColorHex = "#635bff"
export const StripeIcon = ({ className, size }: { className?: string, size?: number }) => {
    return (
        <Avatar
            className={`${className} rounded-lg flex items-center justify-center`}
            style={{
                background: stripeBrandColorHex,
                width: size ? size : 32,
                height: size ? size : 32,
            }}
        >
            <FaStripeS className="text-white" size={size ? size / 2 : 16} />
        </Avatar>
    )
}

export const GoogleIcon = ({ className, size }: { className?: string, size?: number }) => {
    return (
        <Avatar
            className={`${className} rounded-lg flex items-center justify-center bg-background`}
            style={{
                width: size ? size : 32,
                height: size ? size : 32,
            }}
        >
            <AvatarImage
                src="/external-icons/google_analytics-icon.svg"
                alt="@shadcn"
                className="object-contain"
            />
            <AvatarFallback>GA</AvatarFallback>
        </Avatar>
    )
}

