export type Title = 'Mr' | 'Mrs' | 'Ms' | 'Dr' | 'Miss' | 'Prof';
export type Sex = 'Male' | 'Female' | 'Other' | 'Prefer not to say';
export type MaritalStatus = 'Single' | 'Married' | 'De facto' | 'Divorced' | 'Separated' | 'Widowed';
export type EmploymentStatus = 'Employed' | 'Self-employed' | 'Retired' | 'Unemployed' | 'Student' | 'Home duties';
export type EntityType = 'Individual' | 'Couple' | 'Trust' | 'Company' | 'SMSF' | 'Partnership' | 'Sole Trader';
export type RiskProfile = 'Conservative' | 'Moderate' | 'Balanced' | 'Growth' | 'Aggressive';
export type ClientStatus = 'Active' | 'Inactive' | 'Prospect';
export type AddressKind = 'residential' | 'postal' | 'work';
export type PhoneKind = 'mobile' | 'home' | 'work';

export interface Address {
  id: string;
  kind: AddressKind;
  street: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
}

export interface Phone {
  id: string;
  kind: PhoneKind;
  number: string;
}

export interface Client {
  id: number;
  title: Title;
  firstName: string;
  middleName: string;
  lastName: string;
  preferredName: string;
  dateOfBirth: string; // ISO date
  sex: Sex;
  maritalStatus: MaritalStatus;
  countryOfResidence: string;
  citizenship: string;
  taxResidency: string;
  email: string;
  phones: Phone[];
  addresses: Address[];
  occupation: string;
  employer: string;
  employmentStatus: EmploymentStatus;
  annualIncome: number;
  entityType: EntityType;
  riskProfile: RiskProfile;
  primaryAdviserId: number | null;
  secondaryAdviserId: number | null;
  status: ClientStatus;
  createdAt: string;
  updatedAt: string;
}

export const TITLES: Title[] = ['Mr', 'Mrs', 'Ms', 'Dr', 'Miss', 'Prof'];
export const SEXES: Sex[] = ['Male', 'Female', 'Other', 'Prefer not to say'];
export const MARITAL_STATUSES: MaritalStatus[] = ['Single', 'Married', 'De facto', 'Divorced', 'Separated', 'Widowed'];
export const EMPLOYMENT_STATUSES: EmploymentStatus[] = ['Employed', 'Self-employed', 'Retired', 'Unemployed', 'Student', 'Home duties'];
export const ENTITY_TYPES: EntityType[] = ['Individual', 'Couple', 'Trust', 'Company', 'SMSF', 'Partnership', 'Sole Trader'];
export const RISK_PROFILES: RiskProfile[] = ['Conservative', 'Moderate', 'Balanced', 'Growth', 'Aggressive'];
export const CLIENT_STATUSES: ClientStatus[] = ['Active', 'Inactive', 'Prospect'];
export const ADDRESS_KINDS: AddressKind[] = ['residential', 'postal', 'work'];
export const PHONE_KINDS: PhoneKind[] = ['mobile', 'home', 'work'];
