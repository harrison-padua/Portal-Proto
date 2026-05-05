export type RelationshipType =
  | 'Spouse'
  | 'Dependent'
  | 'Business Partner'
  | 'Trust Trustee'
  | 'Trust Beneficiary';

export const RELATIONSHIP_TYPES: RelationshipType[] = [
  'Spouse',
  'Dependent',
  'Business Partner',
  'Trust Trustee',
  'Trust Beneficiary',
];

export interface Relationship {
  id: string;
  fromClientId: number;
  toClientId: number;
  type: RelationshipType;
  // For Dependent type, optional sub-kind
  dependentKind?: 'Child' | 'Other';
}

export const FAMILY_RELATIONSHIP_TYPES: RelationshipType[] = ['Spouse', 'Dependent'];
