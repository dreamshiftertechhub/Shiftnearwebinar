import { supabase } from './supabase'

export type WebinarRegistration = {
  id: string
  full_name: string
  email: string
  phone: string | null
  city: string | null
  role: string
  questions: string | null
  consent: boolean
  created_at: string
}

export type EarlyAccessSignup = {
  id: string
  full_name: string
  email: string
  role: string
  city: string | null
  created_at: string
}

export type VendorInterest = {
  id: string
  business_name: string
  full_name: string
  email: string
  phone: string | null
  business_type: string | null
  city: string | null
  message: string | null
  created_at: string
}

export type ContactEnquiry = {
  id: string
  full_name: string
  email: string
  subject: string
  message: string
  created_at: string
}

export type StaffProfile = {
  id: string
  full_name: string
  email: string
  account_type: string
  created_at: string
}

export async function submitWebinarRegistration(data: {
  full_name: string
  email: string
  phone?: string
  city?: string
  role: string
  questions?: string
  consent: boolean
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'The registration service is not configured.' }
  const { error } = await supabase.from('webinar_registrations').insert({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    city: data.city || null,
    role: data.role,
    questions: data.questions || null,
    consent: data.consent,
  })
  return { error: error ? 'We could not submit your registration. Please try again.' : null }
}

export async function submitEarlyAccess(data: {
  full_name: string
  email: string
  role: string
  city?: string
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'The signup service is not configured.' }
  const { error } = await supabase.from('early_access_signups').insert({
    full_name: data.full_name,
    email: data.email,
    role: data.role,
    city: data.city || null,
  })
  return { error: error ? 'We could not submit your request. Please try again.' : null }
}

export async function submitVendorInterest(data: {
  business_name: string
  full_name: string
  email: string
  phone?: string
  business_type?: string
  city?: string
  message?: string
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'The submission service is not configured.' }
  const { error } = await supabase.from('vendor_interest').insert({
    business_name: data.business_name,
    full_name: data.full_name,
    email: data.email,
    phone: data.phone || null,
    business_type: data.business_type || null,
    city: data.city || null,
    message: data.message || null,
  })
  return { error: error ? 'We could not submit your interest. Please try again.' : null }
}

export async function submitContactEnquiry(data: {
  full_name: string
  email: string
  subject: string
  message: string
}): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'The contact service is not configured.' }
  const { error } = await supabase.from('contact_enquiries').insert({
    full_name: data.full_name,
    email: data.email,
    subject: data.subject,
    message: data.message,
  })
  return { error: error ? 'We could not send your message. Please try again.' : null }
}

export async function fetchWebinarRegistrations(): Promise<{ data: WebinarRegistration[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Service not configured.' }
  const { data, error } = await supabase.from('webinar_registrations').select('*').order('created_at', { ascending: false })
  if (error) return { data: [], error: 'Unable to load registrations.' }
  return { data: data as WebinarRegistration[], error: null }
}

export async function fetchEarlyAccessSignups(): Promise<{ data: EarlyAccessSignup[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Service not configured.' }
  const { data, error } = await supabase.from('early_access_signups').select('*').order('created_at', { ascending: false })
  if (error) return { data: [], error: 'Unable to load signups.' }
  return { data: data as EarlyAccessSignup[], error: null }
}

export async function fetchVendorInterest(): Promise<{ data: VendorInterest[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Service not configured.' }
  const { data, error } = await supabase.from('vendor_interest').select('*').order('created_at', { ascending: false })
  if (error) return { data: [], error: 'Unable to load vendor interest.' }
  return { data: data as VendorInterest[], error: null }
}

export async function fetchContactEnquiries(): Promise<{ data: ContactEnquiry[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Service not configured.' }
  const { data, error } = await supabase.from('contact_enquiries').select('*').order('created_at', { ascending: false })
  if (error) return { data: [], error: 'Unable to load enquiries.' }
  return { data: data as ContactEnquiry[], error: null }
}

export async function deleteWebinarRegistration(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Service not configured.' }
  const { error } = await supabase.from('webinar_registrations').delete().eq('id', id)
  return { error: error ? 'Unable to delete.' : null }
}

export async function deleteEarlyAccessSignup(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Service not configured.' }
  const { error } = await supabase.from('early_access_signups').delete().eq('id', id)
  return { error: error ? 'Unable to delete.' : null }
}

export async function deleteVendorInterest(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Service not configured.' }
  const { error } = await supabase.from('vendor_interest').delete().eq('id', id)
  return { error: error ? 'Unable to delete.' : null }
}

export async function deleteContactEnquiry(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Service not configured.' }
  const { error } = await supabase.from('contact_enquiries').delete().eq('id', id)
  return { error: error ? 'Unable to delete.' : null }
}

export async function fetchStaffProfiles(): Promise<{ data: StaffProfile[]; error: string | null }> {
  if (!supabase) return { data: [], error: 'Service not configured.' }
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, account_type, created_at')
    .order('created_at', { ascending: false })
  if (error) return { data: [], error: 'Unable to load staff accounts.' }
  return { data: data as StaffProfile[], error: null }
}

export async function setProfileAccountType(id: string, accountType: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Service not configured.' }
  const { error } = await supabase.rpc('set_profile_account_type', {
    profile_id: id,
    requested_account_type: accountType,
  })
  return { error: error ? 'Unable to update account access.' : null }
}
