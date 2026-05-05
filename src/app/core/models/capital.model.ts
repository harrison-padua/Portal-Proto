export type AssetType =
  | 'Property'
  | 'Cash'
  | 'Shares'
  | 'Managed Funds'
  | 'Superannuation'
  | 'Vehicle'
  | 'Business'
  | 'Collectibles'
  | 'Other';

export const ASSET_TYPES: AssetType[] = [
  'Property',
  'Cash',
  'Shares',
  'Managed Funds',
  'Superannuation',
  'Vehicle',
  'Business',
  'Collectibles',
  'Other',
];

export type LiabilityType = 'Mortgage' | 'Personal Loan' | 'Credit Card' | 'Business Loan' | 'Tax Debt' | 'Other';

export const LIABILITY_TYPES: LiabilityType[] = [
  'Mortgage',
  'Personal Loan',
  'Credit Card',
  'Business Loan',
  'Tax Debt',
  'Other',
];

export interface Asset {
  id: string;
  ownerClientId: number;
  name: string;
  type: AssetType;
  currentValue: number;
  purchaseValue: number;
  purchaseDate: string;
  ownershipPercentage: number;
  linked_liability_id: string | null;
}

export interface Liability {
  id: string;
  ownerClientId: number;
  name: string;
  type: LiabilityType;
  currentBalance: number;
  originalAmount: number;
  interestRate: number;
  monthlyPayment: number;
  startDate: string;
  endDate: string | null;
  linked_asset_id: string | null;
}
