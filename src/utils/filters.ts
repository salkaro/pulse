import { ICharge } from "@/models/charge";
import { IUser } from "@/models/user";
import { ICustomer } from "@/models/customer";

export function chargeSearchFilter(charges: ICharge[], query?: string) {
    if (!query) return charges

    const queryLower = query.toLowerCase()

    return charges.filter((charge) => {
        const description = charge.description?.toLowerCase() ?? ""
        const email = charge.email.toLowerCase()
        const amount = charge.amount.toString()

        return (
            description.includes(queryLower) ||
            email.includes(queryLower) ||
            amount.includes(queryLower)
        )
    })
}


export function membersSearchFilter(members: IUser[], query?: string) {
    if (!query) return members;

    return members.filter((member) => {
        const queryLower = query.toLowerCase()
        const fullName = `${member.firstname} ${member.lastname}`.toLowerCase()
        const email = member.email?.toLowerCase() ?? ''
        const role = member.organisation?.role?.toLowerCase() ?? ''

        return fullName.includes(queryLower) || email.includes(queryLower) || role.includes(queryLower)
    })
}

export function customersSearchFilter(customers?: ICustomer[] | null, query?: string) {
    if (!customers) return []
    if (!query) return customers;

    const queryLower = query.toLowerCase()

    return customers.filter((customer) => {
        const name = customer.name?.toLowerCase() ?? ''
        const email = customer.email?.toLowerCase() ?? ''

        return name.includes(queryLower) || email.includes(queryLower)
    })
}