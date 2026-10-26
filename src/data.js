export const seedEvents = [
  { id: 'EVT-001', name: 'Fiordini Friendly Match', category: 'Olahraga', date: '2026-11-08', time: '08:00', location: 'CH Fiordini', budget: 1500000, status: 'Akan datang', description: 'Pertandingan persahabatan dan silaturahmi.' },
  { id: 'EVT-002', name: 'Workshop Digital Marketing', category: 'Workshop', date: '2026-11-14', time: '09:00', location: 'Aula Kompas', budget: 2500000, status: 'Akan datang', description: 'Workshop strategi pemasaran digital.' },
  { id: 'EVT-003', name: 'Family Fun Day', category: 'Keluarga', date: '2026-10-18', time: '07:30', location: 'Taman Kota BSD', budget: 1800000, status: 'Selesai', description: 'Kegiatan kebersamaan keluarga.' },
  { id: 'EVT-004', name: 'Kelas Fotografi Dasar', category: 'Pelatihan', date: '2026-12-02', time: '13:00', location: 'Studio Kreatif', budget: 1200000, status: 'Akan datang', description: 'Belajar dasar komposisi dan pencahayaan.' },
]
export const seedParticipants = [
  { id: 'PST-001', eventId: 'EVT-001', name: 'Andi Pratama', email: 'andi@example.com', phone: '081234567801', fee: 100000, payment: 'Lunas', attendance: 'Hadir' },
  { id: 'PST-002', eventId: 'EVT-001', name: 'Budi Santoso', email: 'budi@example.com', phone: '081234567802', fee: 100000, payment: 'Belum bayar', attendance: 'Belum hadir' },
  { id: 'PST-003', eventId: 'EVT-001', name: 'Citra Lestari', email: 'citra@example.com', phone: '081234567803', fee: 100000, payment: 'Lunas', attendance: 'Belum hadir' },
  { id: 'PST-004', eventId: 'EVT-002', name: 'Dewi Anggraini', email: 'dewi@example.com', phone: '081234567804', fee: 250000, payment: 'Lunas', attendance: 'Belum hadir' },
  { id: 'PST-005', eventId: 'EVT-002', name: 'Eko Saputra', email: 'eko@example.com', phone: '081234567805', fee: 250000, payment: 'DP', attendance: 'Belum hadir' },
  { id: 'PST-006', eventId: 'EVT-003', name: 'Fitri Amelia', email: 'fitri@example.com', phone: '081234567806', fee: 75000, payment: 'Lunas', attendance: 'Hadir' },
  { id: 'PST-007', eventId: 'EVT-003', name: 'Gilang Ramadhan', email: 'gilang@example.com', phone: '081234567807', fee: 75000, payment: 'Lunas', attendance: 'Hadir' },
]
export const seedExpenses = [
  { id: 'EXP-001', eventId: 'EVT-001', description: 'Sewa tempat dan meja', amount: 750000, date: '2026-11-08' },
  { id: 'EXP-002', eventId: 'EVT-001', description: 'Konsumsi peserta', amount: 450000, date: '2026-11-08' },
  { id: 'EXP-003', eventId: 'EVT-002', description: 'Honor pembicara', amount: 1000000, date: '2026-11-14' },
  { id: 'EXP-004', eventId: 'EVT-003', description: 'Perlengkapan acara', amount: 600000, date: '2026-10-18' },
]