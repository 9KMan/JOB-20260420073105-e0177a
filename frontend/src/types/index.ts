export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'provider' | 'biller' | 'viewer';
  organization_name?: string;
  npi?: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
}

export interface Patient {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  member_id?: string;
  group_number?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  is_active: boolean;
  created_at: string;
}

export interface Provider {
  id: number;
  user_id: number;
  npi: string;
  first_name: string;
  last_name: string;
  credentials?: string;
  specialty?: string;
  tax_id?: string;
  address_line1?: string;
  address_line2?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  fax?: string;
  created_at: string;
}

export type ClaimStatus = 'draft' | 'submitted' | 'accepted' | 'rejected' | 'appealed' | 'paid';
export type ClaimType = 'professional' | 'institutional';

export interface Claim {
  id: number;
  claim_number: string;
  user_id: number;
  patient_id: number;
  provider_id: number;
  claim_type: ClaimType;
  status: ClaimStatus;
  service_date?: string;
  submission_date?: string;
  amount?: number;
  diagnosis_codes?: string;
  procedure_codes?: string;
  payer_name?: string;
  payer_id?: string;
  notes?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
  patient?: Patient;
  provider?: Provider;
}

export interface Document {
  id: number;
  claim_id: number;
  file_name: string;
  file_type?: 'claim_form' | 'supporting_document' | 'eob' | 'appeal_letter' | 'other';
  mime_type?: string;
  file_size?: number;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}