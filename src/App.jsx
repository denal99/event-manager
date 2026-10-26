import { useEffect, useMemo, useState } from 'react'
import * as XLSX from 'xlsx'
import {
  Activity, ArrowDownRight, ArrowUpRight, CalendarDays, Check, ChevronDown,
  CircleDollarSign, ClipboardList, Download, LayoutDashboard, Menu, Plus,
  Search, Settings2, Trash2, Users, Wallet, X, Pencil, MapPin, Clock3,
  Ticket, TrendingUp, Filter, CalendarCheck, BadgeCheck, CircleAlert
} from 'lucide-react'
import { seedEvents, seedParticipants, seedExpenses } from './data'

const currency = value => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
const dateFormat = value => value ? new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${value}T00:00:00`)) : '-'
const readStore = (key, fallback) => {
  try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback } catch { return fallback }
}
const makeId = prefix => `${prefix}-${Date.now().toString().slice(-7)}`
const statusClass = value => value === 'Lunas' || value === 'Hadir' || value === 'Selesai' ? 'green' : value === 'DP' || value === 'Akan datang' ? 'amber' : 'gray'

function App() {
  const [events, setEvents] = useState(() => readStore('em-events', seedEvents))
  const [participants, setParticipants] = useState(() => readStore('em-participants', seedParticipants))
  const [expenses, setExpenses] = useState(() => readStore('em-expenses', seedExpenses))
  const [page, setPage] = useState('dashboard')
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('Semua status')
  const [selectedEvent, setSelectedEvent] = useState('Semua event')
  const [eventModal, setEventModal] = useState(null)
  const [participantModal, setParticipantModal] = useState(null)
  const [expenseModal, setExpenseModal] = useState(false)
  const [mobileNav, setMobileNav] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => { localStorage.setItem('em-events', JSON.stringify(events)) }, [events])
  useEffect(() => { localStorage.setItem('em-participants', JSON.stringify(participants)) }, [participants])
  useEffect(() => { localStorage.setItem('em-expenses', JSON.stringify(expenses)) }, [expenses])
  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(''), 2800); return () => clearTimeout(t) } }, [toast])

  const totalIncome = participants.filter(p => p.payment === 'Lunas').reduce((sum, p) => sum + Number(p.fee || 0), 0)
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0)
  const filteredEvents = useMemo(() => events.filter(e => {
    const matchesSearch = `${e.name} ${e.location} ${e.category}`.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === 'Semua status' || e.status === filterStatus
    return matchesSearch && matchesStatus
  }), [events, search, filterStatus])
  const currentEvent = events.find(e => e.id === selectedEvent) || null
  const eventParticipants = participants.filter(p => selectedEvent === 'Semua event' || p.eventId === selectedEvent)
  const eventExpenses = expenses.filter(e => selectedEvent === 'Semua event' || e.eventId === selectedEvent)

  const go = next => { setPage(next); setMobileNav(false); setSearch('') }
  const notify = message => setToast(message)
  const saveEvent = data => {
    if (data.id) setEvents(old => old.map(e => e.id === data.id ? data : e))
    else setEvents(old => [{ ...data, id: makeId('EVT') }, ...old])
    setEventModal(null); notify(data.id ? 'Perubahan event disimpan.' : 'Event berhasil ditambahkan.')
  }
  const deleteEvent = event => {
    if (!window.confirm(`Hapus event "${event.name}" beserta peserta dan pengeluarannya?`)) return
    setEvents(old => old.filter(e => e.id !== event.id))
    setParticipants(old => old.filter(p => p.eventId !== event.id))
    setExpenses(old => old.filter(e => e.eventId !== event.id))
    notify('Event dan data terkait berhasil dihapus.')
  }
  const saveParticipant = data => {
    if (data.id) setParticipants(old => old.map(p => p.id === data.id ? data : p))
    else setParticipants(old => [{ ...data, id: makeId('PST') }, ...old])
    setParticipantModal(null); notify(data.id ? 'Data peserta diperbarui.' : 'Peserta berhasil ditambahkan.')
  }
  const saveExpense = data => { setExpenses(old => [{ ...data, id: makeId('EXP') }, ...old]); setExpenseModal(false); notify('Pengeluaran berhasil dicatat.') }

  const exportParticipants = () => {
    const rows = eventParticipants.map(p => ({ 'Nama Peserta': p.name, Event: events.find(e => e.id === p.eventId)?.name || '-', Email: p.email, Telepon: p.phone, 'Biaya Pendaftaran': p.fee, Pembayaran: p.payment, Kehadiran: p.attendance }))
    downloadExcel(rows, 'peserta-event-manager.xlsx', 'Data Peserta')
  }
  const exportFinance = () => {
    const incomeRows = eventParticipants.filter(p => p.payment === 'Lunas').map(p => ({ Tanggal: events.find(e => e.id === p.eventId)?.date || '', Event: events.find(e => e.id === p.eventId)?.name || '-', Jenis: 'Pemasukan', Keterangan: `Pendaftaran: ${p.name}`, Jumlah: Number(p.fee || 0) }))
    const expenseRows = eventExpenses.map(e => ({ Tanggal: e.date, Event: events.find(ev => ev.id === e.eventId)?.name || '-', Jenis: 'Pengeluaran', Keterangan: e.description, Jumlah: -Number(e.amount || 0) }))
    const rows = [...incomeRows, ...expenseRows]
    rows.push({ Tanggal: '', Event: '', Jenis: 'TOTAL', Keterangan: 'Saldo bersih', Jumlah: rows.reduce((s, r) => s + r.Jumlah, 0) })
    downloadExcel(rows, 'laporan-keuangan-event-manager.xlsx', 'Laporan Keuangan')
  }

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? 'sidebar-open' : ''}`}>
      <div className="brand"><div className="brand-icon"><CalendarCheck size={23}/></div><div><strong>event<span>manager</span></strong><small>EVENT MANAGEMENT</small></div><button className="mobile-close icon-button" onClick={() => setMobileNav(false)} aria-label="Tutup menu"><X size={19}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">
        <NavItem active={page === 'dashboard'} icon={<LayoutDashboard size={18}/>} label="Dashboard" onClick={() => go('dashboard')}/>
        <NavItem active={page === 'events'} icon={<CalendarDays size={18}/>} label="Daftar Event" count={events.length} onClick={() => go('events')}/>
        <NavItem active={page === 'participants'} icon={<Users size={18}/>} label="Peserta" onClick={() => go('participants')}/>
        <NavItem active={page === 'finance'} icon={<Wallet size={18}/>} label="Laporan Keuangan" onClick={() => go('finance')}/>
      </nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><Activity size={18}/></div><strong>Kelola event lebih mudah</strong><p>Pantau peserta, pembayaran, dan laporan dalam satu tempat.</p><button onClick={() => go('events')}>Mulai kelola <span>→</span></button></div><div className="profile"><div className="avatar">AD</div><div className="profile-info"><strong>Administrator</strong><span>Pengelola event</span></div><ChevronDown size={16} className="muted"/></div></div>
    </aside>
    {mobileNav && <button className="nav-scrim" aria-label="Tutup navigasi" onClick={() => setMobileNav(false)}/>}
    <main className="main-area">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu icon-button" onClick={() => setMobileNav(true)} aria-label="Buka menu"><Menu size={21}/></button><div className="breadcrumb">Workspace <span>/</span> <strong>{pageTitle(page)}</strong></div></div><div className="topbar-right"><div className="today-chip"><CalendarDays size={15}/>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date())}</div><div className="avatar top-avatar">AD</div></div></header>
      <div className="page-content">
        {page === 'dashboard' && <Dashboard events={events} participants={participants} expenses={expenses} totalIncome={totalIncome} totalExpense={totalExpense} onNavigate={go} onAdd={() => setEventModal({})}/>}
        {page === 'events' && <EventsPage events={filteredEvents} participants={participants} search={search} setSearch={setSearch} filterStatus={filterStatus} setFilterStatus={setFilterStatus} onAdd={() => setEventModal({})} onEdit={e => setEventModal(e)} onDelete={deleteEvent} onParticipants={id => { setSelectedEvent(id); go('participants') }}/>}
        {page === 'participants' && <ParticipantsPage events={events} participants={participants} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} onAdd={() => setParticipantModal({})} onEdit={p => setParticipantModal(p)} onDelete={p => { if (window.confirm(`Hapus peserta ${p.name}?`)) { setParticipants(old => old.filter(x => x.id !== p.id)); notify('Peserta dihapus.') } }} onExport={exportParticipants} onPayment={(p, payment) => setParticipants(old => old.map(x => x.id === p.id ? { ...x, payment } : x))} onAttendance={(p, attendance) => setParticipants(old => old.map(x => x.id === p.id ? { ...x, attendance } : x))}/>}
        {page === 'finance' && <FinancePage events={events} participants={participants} expenses={expenses} selectedEvent={selectedEvent} setSelectedEvent={setSelectedEvent} onAddExpense={() => setExpenseModal(true)} onExport={exportFinance} onDeleteExpense={e => { if (window.confirm('Hapus catatan pengeluaran ini?')) { setExpenses(old => old.filter(x => x.id !== e.id)); notify('Pengeluaran dihapus.') } }}/>}
      </div>
      <footer className="footer"><span>© 2026 Event Manager</span><span>Dibuat untuk pengelolaan event yang lebih rapi.</span></footer>
    </main>
    {eventModal && <EventModal initial={eventModal} onClose={() => setEventModal(null)} onSave={saveEvent}/>}
    {participantModal && <ParticipantModal initial={participantModal} events={events} onClose={() => setParticipantModal(null)} onSave={saveParticipant}/>}
    {expenseModal && <ExpenseModal events={events} onClose={() => setExpenseModal(false)} onSave={saveExpense}/>}
    {toast && <div className="toast"><Check size={17}/>{toast}</div>}
  </div>
}

function NavItem({ active, icon, label, count, onClick }) {
  return <button className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>{icon}<span>{label}</span>{count !== undefined && <small>{count}</small>}</button>
}
function pageTitle(page) { return ({ dashboard: 'Dashboard', events: 'Daftar Event', participants: 'Peserta', finance: 'Laporan Keuangan' })[page] || 'Dashboard' }
function SectionHeading({ eyebrow, title, subtitle, action }) {
  return <div className="section-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{subtitle}</p></div>{action && <div className="heading-action">{action}</div>}</div>
}
function StatCard({ label, value, note, icon, tone, trend }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}>{icon}</div></div><div className="stat-value">{value}</div><div className="stat-note">{trend && <span className="trend"><ArrowUpRight size={14}/>{trend}</span>}{note}</div></div>
}
function Dashboard({ events, participants, expenses, totalIncome, totalExpense, onNavigate, onAdd }) {
  const upcoming = [...events].filter(e => e.status !== 'Selesai').sort((a,b) => a.date.localeCompare(b.date)).slice(0, 4)
  const recent = [...participants].slice(0, 5)
  const paid = participants.filter(p => p.payment === 'Lunas').length
  return <>
    <SectionHeading eyebrow="RINGKASAN AKTIVITAS" title="Dashboard" subtitle="Pantau performa event dan aktivitas terbaru Anda." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Buat event</button>}/>
    <div className="welcome-strip"><div className="welcome-symbol"><Activity size={24}/></div><div><strong>Halo, Administrator! 👋</strong><p>Berikut ringkasan pengelolaan event Anda. Semoga semua acara berjalan lancar.</p></div><div className="welcome-decoration"><CalendarDays size={65}/></div></div>
    <div className="stats-grid">
      <StatCard label="Total event" value={events.length} note={`${events.filter(e => e.status !== 'Selesai').length} event akan datang`} icon={<CalendarDays size={20}/>} tone="blue"/>
      <StatCard label="Total peserta" value={participants.length} note={`${paid} peserta sudah lunas`} icon={<Users size={20}/>} tone="purple"/>
      <StatCard label="Total pemasukan" value={currency(totalIncome)} note="Dari pembayaran lunas" icon={<ArrowDownRight size={20}/>} tone="green" trend="Tercatat"/>
      <StatCard label="Total pengeluaran" value={currency(expenses.reduce((s,e)=>s+Number(e.amount||0),0))} note={`Saldo ${currency(totalIncome-totalExpense)}`} icon={<ArrowUpRight size={20}/>} tone="orange"/>
    </div>
    <div className="dashboard-grid">
      <section className="panel upcoming-panel"><div className="panel-heading"><div><h2>Event mendatang</h2><p>Agenda yang perlu Anda persiapkan</p></div><button className="text-button" onClick={() => onNavigate('events')}>Lihat semua <span>→</span></button></div>
        {upcoming.length ? <div className="upcoming-list">{upcoming.map(e => <div className="upcoming-item" key={e.id}><div className="date-tile"><strong>{new Date(`${e.date}T00:00:00`).getDate()}</strong><span>{new Intl.DateTimeFormat('id-ID',{month:'short'}).format(new Date(`${e.date}T00:00:00`))}</span></div><div className="upcoming-info"><strong>{e.name}</strong><span><Clock3 size={13}/>{e.time} <i>·</i> <MapPin size={13}/>{e.location}</span></div><div className="upcoming-end"><span className={`pill ${statusClass(e.status)}`}>{e.status}</span><small>{participants.filter(p=>p.eventId===e.id).length} peserta</small></div></div>)}</div> : <EmptyState text="Belum ada event mendatang."/>}
      </section>
      <section className="panel quick-panel"><div className="panel-heading"><div><h2>Akses cepat</h2><p>Aktivitas yang sering digunakan</p></div></div><div className="quick-actions">
        <button onClick={onAdd}><div className="quick-icon blue"><Plus size={19}/></div><span><strong>Tambah event</strong><small>Buat agenda baru</small></span><span className="quick-arrow">→</span></button>
        <button onClick={() => onNavigate('participants')}><div className="quick-icon purple"><Users size={19}/></div><span><strong>Kelola peserta</strong><small>Data, pembayaran, hadir</small></span><span className="quick-arrow">→</span></button>
        <button onClick={() => onNavigate('finance')}><div className="quick-icon green"><Wallet size={19}/></div><span><strong>Lihat keuangan</strong><small>Rekap pemasukan & biaya</small></span><span className="quick-arrow">→</span></button>
      </div><div className="mini-summary"><div><span>Rasio pembayaran lunas</span><strong>{participants.length ? Math.round(paid/participants.length*100) : 0}%</strong></div><div className="progress-track"><div style={{width:`${participants.length ? paid/participants.length*100 : 0}%`}}/></div></div></section>
    </div>
    <section className="panel recent-panel"><div className="panel-heading"><div><h2>Peserta terbaru</h2><p>Data peserta yang baru terdaftar</p></div><button className="text-button" onClick={() => onNavigate('participants')}>Semua peserta <span>→</span></button></div>
      <div className="table-wrap"><table><thead><tr><th>Nama peserta</th><th>Event</th><th>Biaya</th><th>Pembayaran</th><th>Kehadiran</th></tr></thead><tbody>{recent.map(p=><tr key={p.id}><td><div className="person-cell"><div className="person-avatar">{p.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div><strong>{p.name}</strong></div></td><td>{events.find(e=>e.id===p.eventId)?.name || '-'}</td><td className="money">{currency(p.fee)}</td><td><span className={`pill ${statusClass(p.payment)}`}>{p.payment}</span></td><td><span className={`pill ${statusClass(p.attendance)}`}>{p.attendance}</span></td></tr>)}</tbody></table></div>
    </section>
  </>
}
function EventsPage({ events, participants, search, setSearch, filterStatus, setFilterStatus, onAdd, onEdit, onDelete, onParticipants }) {
  return <>
    <SectionHeading eyebrow="MANAJEMEN ACARA" title="Daftar Event" subtitle="Buat, atur, dan pantau semua event Anda." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Tambah event</button>}/>
    <div className="panel list-panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama event atau lokasi..."/></div><div className="filter-box"><Filter size={16}/><select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option>Semua status</option><option>Akan datang</option><option>Selesai</option><option>Dibatalkan</option></select></div><span className="result-count">{events.length} event</span></div>
      {events.length ? <div className="table-wrap"><table><thead><tr><th>Nama event</th><th>Tanggal & waktu</th><th>Lokasi</th><th>Peserta</th><th>Status</th><th className="actions-head">Aksi</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td><div className="event-name-cell"><div className="event-type-icon"><Ticket size={17}/></div><div><strong>{e.name}</strong><small>{e.category}</small></div></div></td><td><strong>{dateFormat(e.date)}</strong><small className="subline">{e.time} WIB</small></td><td>{e.location}</td><td><span className="participant-count"><Users size={14}/>{' '}{participants.filter(p => p.eventId === e.id).length}</span></td><td><span className={`pill ${statusClass(e.status)}`}>{e.status}</span></td><td><div className="row-actions"><button title="Kelola peserta" onClick={()=>onParticipants(e.id)}><Users size={16}/></button><button title="Edit event" onClick={()=>onEdit(e)}><Pencil size={16}/></button><button title="Hapus event" className="danger-action" onClick={()=>onDelete(e)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div> : <EmptyState text="Event tidak ditemukan. Coba ubah kata kunci atau filter."/>}
      <div className="table-foot"><span>Menampilkan {events.length} event</span><span>Data tersimpan otomatis di browser</span></div>
    </div>
    <div className="info-note"><CircleAlert size={17}/><span>Data versi awal disimpan di browser yang Anda gunakan. Ekspor cadangan secara berkala untuk menghindari kehilangan data.</span></div>
  </>
}
function ParticipantsPage({ events, participants, selectedEvent, setSelectedEvent, onAdd, onEdit, onDelete, onExport, onPayment, onAttendance }) {
  const [search, setSearch] = useState('')
  const filtered = participants.filter(p => (selectedEvent === 'Semua event' || p.eventId === selectedEvent) && `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(search.toLowerCase()))
  const paid = filtered.filter(p=>p.payment==='Lunas').length
  return <>
    <SectionHeading eyebrow="DATABASE PESERTA" title="Peserta" subtitle="Kelola registrasi, status pembayaran, dan kehadiran." action={<><button className="btn btn-secondary" onClick={onExport}><Download size={16}/> Ekspor Excel</button><button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Tambah peserta</button></>}/>
    <div className="stats-grid compact-stats"><StatCard label="Total peserta" value={filtered.length} note="Sesuai filter saat ini" icon={<Users size={20}/>} tone="blue"/><StatCard label="Pembayaran lunas" value={paid} note={`${filtered.length ? Math.round(paid/filtered.length*100) : 0}% dari peserta`} icon={<BadgeCheck size={20}/>} tone="green"/><StatCard label="Belum bayar / DP" value={filtered.filter(p=>p.payment!=='Lunas').length} note="Perlu ditindaklanjuti" icon={<CircleAlert size={20}/>} tone="orange"/></div>
    <div className="panel list-panel"><div className="toolbar"><div className="search-box"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari nama, email, atau telepon..."/></div><div className="filter-box"><CalendarDays size={16}/><select value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)}><option>Semua event</option>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div><span className="result-count">{filtered.length} peserta</span></div>
      {filtered.length ? <div className="table-wrap"><table><thead><tr><th>Peserta</th><th>Event</th><th>Biaya</th><th>Pembayaran</th><th>Kehadiran</th><th>Aksi</th></tr></thead><tbody>{filtered.map(p=><tr key={p.id}><td><div className="person-cell"><div className="person-avatar">{p.name.split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}</div><div><strong>{p.name}</strong><small>{p.email}</small></div></div></td><td>{events.find(e=>e.id===p.eventId)?.name || '-'}</td><td className="money">{currency(p.fee)}</td><td><select className={`inline-select ${statusClass(p.payment)}`} value={p.payment} onChange={e=>onPayment(p,e.target.value)} aria-label={`Pembayaran ${p.name}`}><option>Lunas</option><option>DP</option><option>Belum bayar</option></select></td><td><select className={`inline-select ${statusClass(p.attendance)}`} value={p.attendance} onChange={e=>onAttendance(p,e.target.value)} aria-label={`Kehadiran ${p.name}`}><option>Belum hadir</option><option>Hadir</option><option>Absen</option></select></td><td><div className="row-actions"><button title="Edit peserta" onClick={()=>onEdit(p)}><Pencil size={16}/></button><button title="Hapus peserta" className="danger-action" onClick={()=>onDelete(p)}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div> : <EmptyState text="Belum ada peserta yang sesuai."/>}
      <div className="table-foot"><span>{filtered.length} peserta ditampilkan</span><span>Status dapat diubah langsung dari tabel</span></div>
    </div>
  </>
}
function FinancePage({ events, participants, expenses, selectedEvent, setSelectedEvent, onAddExpense, onExport, onDeleteExpense }) {
  const filteredP = participants.filter(p=>selectedEvent==='Semua event'||p.eventId===selectedEvent)
  const filteredE = expenses.filter(e=>selectedEvent==='Semua event'||e.eventId===selectedEvent)
  const income = filteredP.filter(p=>p.payment==='Lunas').reduce((s,p)=>s+Number(p.fee||0),0)
  const expense = filteredE.reduce((s,e)=>s+Number(e.amount||0),0)
  const rows = [...filteredP.filter(p=>p.payment==='Lunas').map(p=>({id:p.id,date:events.find(e=>e.id===p.eventId)?.date||'',eventId:p.eventId,description:`Pendaftaran peserta — ${p.name}`,kind:'Pemasukan',amount:Number(p.fee||0)})), ...filteredE.map(e=>({...e,kind:'Pengeluaran',amount:-Number(e.amount||0)}))].sort((a,b)=>b.date.localeCompare(a.date))
  return <>
    <SectionHeading eyebrow="KEUANGAN EVENT" title="Laporan Keuangan" subtitle="Pantau pemasukan, pengeluaran, dan saldo bersih per event." action={<><button className="btn btn-secondary" onClick={onExport}><Download size={16}/> Ekspor Excel</button><button className="btn btn-primary" onClick={onAddExpense}><Plus size={17}/> Catat pengeluaran</button></>}/>
    <div className="finance-filter"><div><strong>Periode laporan</strong><span>Pilih event untuk melihat laporan yang lebih spesifik.</span></div><div className="filter-box"><Filter size={16}/><select value={selectedEvent} onChange={e=>setSelectedEvent(e.target.value)}><option>Semua event</option>{events.map(e=><option key={e.id} value={e.id}>{e.name}</option>)}</select></div></div>
    <div className="stats-grid finance-stats"><StatCard label="Total pemasukan" value={currency(income)} note="Hanya pembayaran lunas" icon={<ArrowDownRight size={20}/>} tone="green"/><StatCard label="Total pengeluaran" value={currency(expense)} note={`${filteredE.length} catatan pengeluaran`} icon={<ArrowUpRight size={20}/>} tone="orange"/><StatCard label="Saldo bersih" value={currency(income-expense)} note="Pemasukan dikurangi pengeluaran" icon={<CircleDollarSign size={20}/>} tone="blue"/></div>
    <div className="panel list-panel"><div className="panel-heading inside-heading"><div><h2>Rincian transaksi</h2><p>{selectedEvent==='Semua event'?'Gabungan seluruh event':events.find(e=>e.id===selectedEvent)?.name}</p></div><span className="transaction-count">{rows.length} transaksi</span></div>
      {rows.length ? <div className="table-wrap"><table><thead><tr><th>Tanggal</th><th>Event</th><th>Keterangan</th><th>Jenis</th><th className="align-right">Jumlah</th><th>Aksi</th></tr></thead><tbody>{rows.map(r=><tr key={`${r.kind}-${r.id}`}><td>{dateFormat(r.date)}</td><td>{events.find(e=>e.id===r.eventId)?.name||'-'}</td><td>{r.description}</td><td><span className={`pill ${r.kind==='Pemasukan'?'green':'orange-pill'}`}>{r.kind}</span></td><td className={`money align-right ${r.amount<0?'negative':'positive'}`}>{r.amount<0?`−${currency(Math.abs(r.amount))}`:currency(r.amount)}</td><td>{r.kind==='Pengeluaran'&&<button className="table-icon-button danger-action" title="Hapus pengeluaran" onClick={()=>onDeleteExpense(r)}><Trash2 size={16}/></button>}</td></tr>)}</tbody><tfoot><tr><td colSpan="4">Saldo bersih</td><td className="money align-right">{currency(income-expense)}</td><td/></tr></tfoot></table></div> : <EmptyState text="Belum ada transaksi untuk event ini."/>}
      <div className="table-foot"><span>Catatan pemasukan diambil dari peserta berstatus Lunas.</span><span>Jumlah dalam Rupiah (IDR)</span></div>
    </div>
    <div className="info-note"><CircleAlert size={17}/><span>Versi awal mencatat pemasukan dari biaya peserta yang berstatus “Lunas”. Pembayaran DP belum dihitung sebagai pemasukan agar laporan tidak menganggap seluruh biaya sudah diterima.</span></div>
  </>
}
function EmptyState({ text }) { return <div className="empty-state"><div><ClipboardList size={25}/></div><strong>Data belum tersedia</strong><p>{text}</p></div> }
function downloadExcel(rows, filename, sheetName) {
  const ws = XLSX.utils.json_to_sheet(rows)
  ws['!cols'] = Object.keys(rows[0] || {}).map(key => ({ wch: Math.min(34, Math.max(14, key.length + 3)) }))
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}
function Modal({ title, subtitle, onClose, children, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose()}}><div className={`modal ${wide?'modal-wide':''}`} role="dialog" aria-modal="true" aria-label={title}><div className="modal-heading"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" onClick={onClose} aria-label="Tutup"><X size={20}/></button></div>{children}</div></div>
}
function EventModal({ initial, onClose, onSave }) {
  const [form,setForm] = useState({ name:'', category:'Olahraga', date:'2026-11-20', time:'08:00', location:'', budget:0, status:'Akan datang', description:'', ...initial })
  const update=(key,value)=>setForm(old=>({...old,[key]:value}))
  const submit=e=>{e.preventDefault();if(!form.name.trim()||!form.date||!form.location.trim())return;onSave({...form,budget:Number(form.budget||0)})}
  return <Modal title={initial.id?'Edit event':'Buat event baru'} subtitle="Lengkapi informasi utama acara Anda." onClose={onClose}><form className="form-body" onSubmit={submit}>
    <Field label="Nama event" required><input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Contoh: Seminar tahunan" required/></Field>
    <div className="form-row"><Field label="Kategori"><select value={form.category} onChange={e=>update('category',e.target.value)}>{['Olahraga','Seminar','Workshop','Pelatihan','Keluarga','Komunitas','Lainnya'].map(x=><option key={x}>{x}</option>)}</select></Field><Field label="Status"><select value={form.status} onChange={e=>update('status',e.target.value)}><option>Akan datang</option><option>Selesai</option><option>Dibatalkan</option></select></Field></div>
    <div className="form-row"><Field label="Tanggal" required><input type="date" value={form.date} onChange={e=>update('date',e.target.value)} required/></Field><Field label="Waktu"><input type="time" value={form.time} onChange={e=>update('time',e.target.value)}/></Field></div>
    <Field label="Lokasi" required><input value={form.location} onChange={e=>update('location',e.target.value)} placeholder="Nama tempat / alamat" required/></Field>
    <Field label="Anggaran (Rp)"><input type="number" min="0" value={form.budget} onChange={e=>update('budget',e.target.value)}/></Field>
    <Field label="Deskripsi"><textarea rows="3" value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Catatan singkat mengenai event..."/></Field>
    <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button><button className="btn btn-primary" type="submit"><Check size={16}/> Simpan event</button></div>
  </form></Modal>
}
function ParticipantModal({ initial, events, onClose, onSave }) {
  const [form,setForm]=useState({eventId:events[0]?.id||'',name:'',email:'',phone:'',fee:0,payment:'Belum bayar',attendance:'Belum hadir',...initial})
  const update=(k,v)=>setForm(o=>({...o,[k]:v}))
  const submit=e=>{e.preventDefault();if(!form.eventId||!form.name.trim())return;onSave({...form,fee:Number(form.fee||0)})}
  return <Modal title={initial.id?'Edit peserta':'Tambah peserta'} subtitle="Hubungkan peserta dengan event yang diikuti." onClose={onClose}><form className="form-body" onSubmit={submit}>
    <Field label="Event" required><select value={form.eventId} onChange={e=>update('eventId',e.target.value)} required>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}</select></Field>
    <Field label="Nama lengkap" required><input value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Nama peserta" required/></Field>
    <Field label="Email"><input type="email" value={form.email} onChange={e=>update('email',e.target.value)} placeholder="nama@email.com"/></Field>
    <Field label="Nomor telepon"><input value={form.phone} onChange={e=>update('phone',e.target.value)} placeholder="08xxxxxxxxxx"/></Field>
    <Field label="Biaya pendaftaran (Rp)"><input type="number" min="0" value={form.fee} onChange={e=>update('fee',e.target.value)}/></Field>
    <div className="form-row"><Field label="Pembayaran"><select value={form.payment} onChange={e=>update('payment',e.target.value)}><option>Lunas</option><option>DP</option><option>Belum bayar</option></select></Field><Field label="Kehadiran"><select value={form.attendance} onChange={e=>update('attendance',e.target.value)}><option>Belum hadir</option><option>Hadir</option><option>Absen</option></select></Field></div>
    <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button><button className="btn btn-primary" type="submit"><Check size={16}/> Simpan peserta</button></div>
  </form></Modal>
}
function ExpenseModal({ events, onClose, onSave }) {
  const [form,setForm]=useState({eventId:events[0]?.id||'',description:'',amount:'',date:new Date().toISOString().slice(0,10)})
  const update=(k,v)=>setForm(o=>({...o,[k]:v}))
  const submit=e=>{e.preventDefault();if(!form.eventId||!form.description.trim()||Number(form.amount)<=0)return;onSave({...form,amount:Number(form.amount)})}
  return <Modal title="Catat pengeluaran" subtitle="Tambahkan biaya yang dikeluarkan untuk event." onClose={onClose}><form className="form-body" onSubmit={submit}>
    <Field label="Event" required><select value={form.eventId} onChange={e=>update('eventId',e.target.value)} required>{events.map(ev=><option key={ev.id} value={ev.id}>{ev.name}</option>)}</select></Field>
    <Field label="Keterangan pengeluaran" required><input value={form.description} onChange={e=>update('description',e.target.value)} placeholder="Contoh: konsumsi peserta" required/></Field>
    <Field label="Jumlah (Rp)" required><input type="number" min="1" value={form.amount} onChange={e=>update('amount',e.target.value)} placeholder="500000" required/></Field>
    <Field label="Tanggal" required><input type="date" value={form.date} onChange={e=>update('date',e.target.value)} required/></Field>
    <div className="modal-actions"><button type="button" className="btn btn-secondary" onClick={onClose}>Batal</button><button className="btn btn-primary" type="submit"><Check size={16}/> Simpan pengeluaran</button></div>
  </form></Modal>
}
function Field({ label, required, children }) { return <label className="form-field"><span>{label}{required&&<i> *</i>}</span>{children}</label> }

export default App