export interface Address {
 id: string;
 userId: string;
 recipientName: string;
 phone: string;
 province: string;
 city: string;
 district: string;
 postalCode: string;
 fullAddress: string;
 label: string; // e.g., "Home", "Office"
 isDefault: boolean;
 createdAt: string;
 updatedAt: string;
}

export interface AddressInput {
 recipientName: string;
 phone: string;
 province: string;
 city: string;
 district: string;
 postalCode: string;
 fullAddress: string;
 label: string;
 isDefault?: boolean;
}
