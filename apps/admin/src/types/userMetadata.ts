export interface userMetadata {
    "last_name": string
    "first_name": string
    "account_type": string
    "email_verified": string
    "invited"?: boolean
    "invite_type"?: Invite_Type
}

export enum Invite_Type {
    Generic = "Generic",
    User = "User"
}