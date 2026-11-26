import { useEffect, useState } from 'react'
import { Trash2, Users, Store, Mail, Video, Download, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth'
import { navigate } from '../lib/router'
import {
  fetchWebinarRegistrations,
  fetchEarlyAccessSignups,
  fetchVendorInterest,
  fetchContactEnquiries,
  fetchStaffProfiles,
  deleteWebinarRegistration,
  deleteEarlyAccessSignup,
  deleteVendorInterest,
  deleteContactEnquiry,
  setProfileAccountType,
  type WebinarRegistration,
  type EarlyAccessSignup,
  type VendorInterest,
  type ContactEnquiry,
  type StaffProfile,
} from '../lib/registrations'

type Tab = 'webinar' | 'early' | 'vendor' | 'contact' | 'staff'

type Submission = WebinarRegistration | EarlyAccessSignup | VendorInterest | ContactEnquiry

export function AdminPage() {
  const { profile, user, loading } = useAuth()
  const [tab, setTab] = useState<Tab>('webinar')
  const [webinar, setWebinar] = useState<WebinarRegistration[]>([])
  const [early, setEarly] = useState<EarlyAccessSignup[]>([])
  const [vendor, setVendor] = useState<VendorInterest[]>([])
  const [contact, setContact] = useState<ContactEnquiry[]>([])
  const [staff, setStaff] = useState<StaffProfile[]>([])
  const [dataError, setDataError] = useState<string | null>(null)

  useEffect(() => {
    if (loading || (user && !profile)) return
    if (!user) { navigate('/login'); return }
    if (!profile || profile.account_type !== 'admin') { navigate('/'); return }
    void loadAll()
  }, [profile, user, loading])

  const loadAll = async () => {
    const [w, e, v, c, s] = await Promise.all([
      fetchWebinarRegistrations(),
      fetchEarlyAccessSignups(),
      fetchVendorInterest(),
      fetchContactEnquiries(),
      fetchStaffProfiles(),
    ])
    setWebinar(w.data)
    setEarly(e.data)
    setVendor(v.data)
    setContact(c.data)
    setStaff(s.data)
    setDataError(w.error || e.error || v.error || c.error || s.error || null)
  }

  const handleDelete = async (selectedTab: Exclude<Tab, 'staff'>, id: string) => {
    const fn = selectedTab === 'webinar' ? deleteWebinarRegistration : selectedTab === 'early' ? deleteEarlyAccessSignup : selectedTab === 'vendor' ? deleteVendorInterest : deleteContactEnquiry
    await fn(id)
    void loadAll()
  }

  const handleAccessChange = async (id: string, accountType: string) => {
    const result = await setProfileAccountType(id, accountType)
    if (result.error) setDataError(result.error)
    else void loadAll()
  }

  const exportCSV = () => {
    const data: Submission[] = tab === 'webinar' ? webinar : tab === 'early' ? early : tab === 'vendor' ? vendor : contact
    if (!data.length) return
    const headers = Object.keys(data[0])
    const rows = data.map((row) => headers.map((h) => `"${String((row as Record<string, unknown>)[h] ?? '').replace(/"/g, '""')}"`).join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `shiftnear-${tab}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  if (loading || (user && !profile)) return <div className="admin-loading">Loading your dashboard...</div>
  if (!user) return null
  if (!profile || profile.account_type !== 'admin') return null

  const tabs: { key: Tab; label: string; icon: typeof Video; count: number }[] = [
    { key: 'webinar', label: 'Webinar Registrations', icon: Video, count: webinar.length },
    { key: 'early', label: 'Early Access', icon: Users, count: early.length },
    { key: 'vendor', label: 'Vendor Interest', icon: Store, count: vendor.length },
    { key: 'contact', label: 'Contact Enquiries', icon: Mail, count: contact.length },
    { key: 'staff', label: 'Staff Access', icon: ShieldCheck, count: staff.length },
  ]

  const currentData: Submission[] = tab === 'webinar' ? webinar : tab === 'early' ? early : tab === 'vendor' ? vendor : contact

  return (
    <div className="page-admin">
      <div className="page-width">
        <div className="admin-header">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1>{tab === 'staff' ? 'Staff access' : 'Webinar registrations'}</h1>
            <p className="admin-subtitle">
              {tab === 'staff'
                ? 'Give trusted team members dashboard access after they create an account.'
                : `See every ShiftNear Live registration. ${webinar.length} ${webinar.length === 1 ? 'person has' : 'people have'} registered so far.`}
            </p>
          </div>
          {tab !== 'staff' && (
            <button onClick={exportCSV} className="button button--outline-dark button--small" disabled={!currentData.length}>
              <Download size={15} /> Export CSV
            </button>
          )}
        </div>

        <div className="admin-stats">
          {tabs.map((item) => (
            <button key={item.key} className={`admin-stat-card ${tab === item.key ? 'is-active' : ''}`} onClick={() => setTab(item.key)}>
              <div className="admin-stat-icon"><item.icon size={20} /></div>
              <div>
                <span className="admin-stat-count">{item.count}</span>
                <span className="admin-stat-label">{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        {dataError && <div className="form-error">{dataError}</div>}

        {tab === 'staff' ? (
          <div className="admin-table-wrap">
            {staff.length === 0 ? <div className="admin-empty">No accounts yet.</div> : (
              <table className="admin-table">
                <thead><tr><th>Name</th><th>Email</th><th>Account type</th><th>Created</th><th>Access</th></tr></thead>
                <tbody>
                  {staff.map((member) => (
                    <tr key={member.id}>
                      <td data-label="Name">{member.full_name || 'Unnamed account'}</td>
                      <td data-label="Email">{member.email}</td>
                      <td data-label="Account type">{member.account_type}</td>
                      <td data-label="Created">{new Date(member.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                      <td data-label="Access">
                        <select className="form-input admin-role-select" value={member.account_type} onChange={(event) => void handleAccessChange(member.id, event.target.value)}>
                          <option value="buyer">Regular user</option>
                          <option value="renter">Renter</option>
                          <option value="agent">Agent</option>
                          <option value="property_owner">Property owner</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ) : (
          <div className="admin-table-wrap">
            {currentData.length === 0 ? <div className="admin-empty">No submissions yet.</div> : (
              <table className="admin-table">
                <thead><tr>{Object.keys(currentData[0]).filter((key) => key !== 'id').map((key) => <th key={key}>{key.replace(/_/g, ' ')}</th>)}<th></th></tr></thead>
                <tbody>
                  {currentData.map((row) => (
                    <tr key={row.id}>
                      {Object.entries(row).filter(([key]) => key !== 'id').map(([key, value]) => (
                        <td key={key} data-label={key}>
                          {key === 'created_at' ? new Date(value as string).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : key === 'consent' ? value ? 'Yes' : 'No' : String(value ?? '—')}
                        </td>
                      ))}
                      <td><button className="admin-delete" onClick={() => void handleDelete(tab, row.id)} aria-label="Delete"><Trash2 size={15} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
