# Matriks kapabilitas AAPM UI (Vue)

> Generated from `src/design-system/capabilities.ts` by `pnpm capabilities:doc` — do not edit by hand.

83 kebutuhan: AAPM Ecosystem (UI-*), ERP rute (R01–R16), dan ERP platform (PC01–PC22). Status mengikuti aturan spec B1 (`docs/superpowers/specs/2026-11-05-aapm-vue-ds-b1-foundation-design.md`).

## Ringkasan

| Status | B1 | B2 | B3 | B4 | Total |
|---|---:|---:|---:|---:|---:|
| Ada | 6 | 0 | 0 | 0 | 6 |
| Sebagian | 0 | 23 | 6 | 7 | 36 |
| Belum | 0 | 15 | 19 | 3 | 37 |
| Milik produk | 0 | 0 | 0 | 4 | 4 |
| **Total** | 6 | 38 | 25 | 14 | 83 |

## Semua kebutuhan

| ID | Kebutuhan | Sumber | Status | Sub-proyek | Prioritas | Demo | Catatan |
|---|---|---|---|---|---|---|---|
| UI-DAT-001 | DataTable standar | AAPM Ecosystem | Ada | B1 | P0 | `/ui-kit#tabel` |  |
| UI-DAT-006 | Panel grafik | AAPM Ecosystem | Ada | B1 | P0 | `/ui-kit#grafik` |  |
| UI-DAT-008 | Chip / badge status | AAPM Ecosystem | Ada | B1 | P0 | `/ui-kit#status-semantik` |  |
| UI-FND-012 | Sumber warna brand AAPM yang persis | AAPM Ecosystem | Ada | B1 | P0 | `/ui-kit#brand-token` |  |
| UI-FRM-003 | Select / Combobox / MultiSelect | AAPM Ecosystem | Ada | B1 | P0 | `/ui-kit#pemilih` |  |
| UI-FRM-005 | Textarea / catatan panjang | AAPM Ecosystem | Ada | B1 | P0 | `/ui-kit#input` |  |
| UI-DAT-004 | Kartu metrik | AAPM Ecosystem | Sebagian | B2 | P0 | — | KPI card masih di pages/dashboard; perlu dipindah ke components/aapm dan diberi demo /ui-kit. |
| UI-DAT-005 | Klaster / grid KPI | AAPM Ecosystem | Sebagian | B2 | P0 | — | Grid KPI dashboard ada; belum jadi pola reusable dan belum ada demo /ui-kit. |
| UI-DAT-007 | Ringkasan record / fakta key-value | AAPM Ecosystem | Sebagian | B2 | P0 | `/ui-kit#dokumen` | Header dokumen ada; komponen KeyValueList umum belum. |
| UI-FND-001 | Shell aplikasi adaptif terautentikasi | AAPM Ecosystem | Sebagian | B2 | P0 | — | Shell dipakai di seluruh aplikasi, tetapi belum ada demo /ui-kit dan kontraknya belum ditulis. |
| UI-FND-004 | Pemilih konteks tenant / farm / perusahaan | AAPM Ecosystem | Sebagian | B2 | P0 | `/ui-kit#perusahaan` | Pemilih perusahaan ada; level farm/tenant dan pemberitahuan pindah konteks ke tab lain belum. |
| UI-FND-005 | Breadcrumb dan kembali yang aman | AAPM Ecosystem | Sebagian | B2 | P0 | — | Breadcrumb aktif di header, tetapi belum ada demo /ui-kit. |
| UI-FND-006 | Header halaman dan aksi kontekstual | AAPM Ecosystem | Sebagian | B2 | P0 | — | Dipakai semua halaman, tetapi belum ada demo /ui-kit tersendiri. |
| UI-FND-008 | Tab dan segmentasi rute lokal | AAPM Ecosystem | Sebagian | B2 | P0 | `/ui-kit#navigasi` | Tab lokal ada; tab yang tersinkron ke URL (segmentasi rute) belum. |
| UI-FND-010 | Shell autentikasi | AAPM Ecosystem | Sebagian | B2 | P0 | — | Halaman masuk dua kolom ada; masih di pages/ (belum komponen layer) dan belum ada demo /ui-kit. |
| UI-FND-011 | Densitas dan geometri responsif | AAPM Ecosystem | Sebagian | B2 | P0 | — | Densitas otomatis untuk layar pendek ada; pilihan comfortable/compact/dense dan demo /ui-kit belum. |
| UI-FRM-001 | Field berlabel dengan error, hint, dan read-only | AAPM Ecosystem | Sebagian | B2 | P0 | `/ui-kit#input` | Field berlabel ada; contoh hint, read-only, dan error per field di /ui-kit#input belum. |
| UI-FRM-002 | Input angka, mata uang, dan persen | AAPM Ecosystem | Sebagian | B2 | P0 | `/ui-kit#pemilih` | Input angka bulat ada; input mata uang (Rp) dan persen belum. |
| UI-FRM-004 | Tanggal, rentang tanggal, waktu, tanggal-waktu | AAPM Ecosystem | Sebagian | B2 | P0 | `/ui-kit#pemilih` | Tanggal dan rentang ada; input waktu dan tanggal-waktu belum. |
| PC05 | Kesiapan dan onboarding perusahaan | ERP · platform | Belum | B2 | P1 | — |  |
| PC09 | Persetujuan dan delegasi | ERP · platform | Sebagian | B2 | P1 | `/ui-kit#persetujuan` | Timeline ada; approver efektif, delegasi, dan "tidak ada approver" belum. |
| PC11 | Audit dan lineage | ERP · platform | Sebagian | B2 | P1 | `/ui-kit#dokumen` | Audit drawer ada; korelasi sumber dan akses baca berlingkup belum. |
| PC17 | Setting dan ketersediaan fitur | ERP · platform | Belum | B2 | P1 | — |  |
| UI-DAT-009 | Perbandingan rencana vs aktual | AAPM Ecosystem | Sebagian | B2 | P1 | — | Grafik HD aktual vs standar ada; pola tabel rencana-vs-aktual dan demo /ui-kit belum. |
| UI-DAT-010 | Revisi / ringkasan perubahan | AAPM Ecosystem | Sebagian | B2 | P1 | `/ui-kit#dokumen` | Before/after ada di audit drawer; kontrak lengkap (alasan, pelaku, waktu, bukti, state sebelum/sesudah) belum. |
| UI-DAT-011 | Objek terkait | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-DAT-012 | Entity 360 | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-DAT-013 | Bukti / lampiran | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-DAT-014 | Kapasitas / utilisasi / cakupan | AAPM Ecosystem | Sebagian | B2 | P1 | `/ui-kit#grafik` | Bullet dan gauge ada; resep load planning / forecast kapasitas belum. |
| UI-DAT-015 | Tampilan dan pemilihan pohon / hierarki | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-DAT-016 | Permukaan hasil laporan | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-DAT-017 | Narasi aktivitas / audit yang imutabel | AAPM Ecosystem | Sebagian | B2 | P1 | `/ui-kit#persetujuan` | Timeline persetujuan ada; activity feed umum belum. |
| UI-FND-002 | Navigasi dalam berbasis izin | AAPM Ecosystem | Sebagian | B2 | P1 | — | Sidebar bertingkat ada; belum difilter izin dan belum ada demo /ui-kit. |
| UI-FND-003 | Navigasi seksi dalam halaman | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-FND-007 | Overlay profil, tema, dan notifikasi | AAPM Ecosystem | Sebagian | B2 | P1 | — | Profil dan tema ada; panel notifikasi belum; belum ada demo /ui-kit. |
| UI-FND-013 | Navigasi bawah web yang sadar safe-area | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-FND-014 | Pemilih hierarki / resource scope | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-FRM-006 | Form panjang multi-seksi | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-FRM-007 | Form keputusan yang berdampak | AAPM Ecosystem | Sebagian | B2 | P1 | — | Pratinjau dampak ada; resep keputusan dengan alasan wajib dan demo /ui-kit belum. |
| UI-FRM-008 | Ketersediaan aksi baris beserta alasannya | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-FRM-009 | Ringkasan rekonsiliasi | AAPM Ecosystem | Sebagian | B2 | P1 | `/ui-kit#jurnal` | Debit = kredit ada; ringkasan rekonsiliasi umum (selisih, penjelasan) belum. |
| UI-FRM-010 | Entri progres / realisasi append-only | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-FRM-011 | Form koreksi | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| UI-WRK-READINESS | Review kesiapan / kelayakan / pemblokir | AAPM Ecosystem | Belum | B2 | P1 | — |  |
| R01 | Daftar penerimaan standard (tabel server) | ERP · rute | Sebagian | B3 | P0 | `/ui-kit#tabel` | Daftar contoh ada; paging server dan scope inventori belum. |
| R02 | Siapkan penerimaan standard (form) | ERP · rute | Sebagian | B3 | P0 | `/ui-kit#dokumen` | Header dan editor baris ada; master barang, jasa vs stok belum. |
| R03 | Simpan penerimaan standard dan hasil commit | ERP · rute | Belum | B3 | P0 | — |  |
| R04 | Buka koreksi dengan dampak dan alasan kunci | ERP · rute | Belum | B3 | P0 | — |  |
| R05 | Koreksi atomik dan pemulihan | ERP · rute | Belum | B3 | P0 | — |  |
| R06 | Hapus yang eligible beserta dampaknya | ERP · rute | Belum | B3 | P0 | — |  |
| R07 | Daftar penerimaan jagung & dedak | ERP · rute | Belum | B3 | P0 | — |  |
| R08 | Form dan detail timbang | ERP · rute | Belum | B3 | P0 | — |  |
| R09 | Simpan timbang, detail, dan batch | ERP · rute | Belum | B3 | P0 | — |  |
| R10 | Buka koreksi timbang | ERP · rute | Belum | B3 | P0 | — |  |
| R11 | Koreksi timbang sesuai dampak | ERP · rute | Belum | B3 | P0 | — |  |
| R12 | Hapus timbang yang eligible | ERP · rute | Belum | B3 | P0 | — |  |
| R13 | Cetak BAST | ERP · rute | Belum | B3 | P0 | — |  |
| R14 | Cetak rekap timbang | ERP · rute | Belum | B3 | P0 | — |  |
| R15 | Tinjau jurnal stok | ERP · rute | Sebagian | B3 | P0 | `/ui-kit#jurnal` | Pratinjau jurnal ada; daftar jurnal stok per gudang belum. |
| R16 | Data tabel jurnal stok | ERP · rute | Belum | B3 | P0 | — |  |
| PC06 | UI bersama (token, shell, ikon, kontrak tabel/form/detail/riwayat) | ERP · platform | Sebagian | B3 | P1 | `/ui-kit#brand-token` | Token, ikon, dan tabel ada; kontrak form/detail/riwayat baru sebagian. |
| PC07 | Draft dan konkurensi | ERP · platform | Belum | B3 | P1 | — |  |
| PC08 | Penomoran dokumen | ERP · platform | Belum | B3 | P1 | — |  |
| PC10 | Periode, backdate, dan jam bisnis | ERP · platform | Belum | B3 | P1 | — |  |
| PC12 | Lampiran | ERP · platform | Belum | B3 | P1 | — |  |
| PC15 | Impor, ekspor, dan cetak | ERP · platform | Belum | B3 | P1 | — |  |
| PC16 | Pencarian dan lookup | ERP · platform | Sebagian | B3 | P1 | `/ui-kit#pemilih` | Combobox ada; lookup berlingkup dengan paging dan referensi nonaktif historis belum. |
| UI-DAT-003 | Tabel ledger / mutasi | AAPM Ecosystem | Sebagian | B3 | P1 | `/ui-kit#stok` | Kartu stok ada; tabel ledger umum dengan filter, paging, dan saldo berjalan belum. |
| UI-FRM-012 | Unggah / ambil bukti di web | AAPM Ecosystem | Belum | B3 | P1 | — |  |
| UI-FND-015 | Ekspor interoperabilitas token (DTCG) | AAPM Ecosystem | Belum | B4 | P0 | — |  |
| PC01 | Identitas dan pemulihan akses | ERP · platform | Sebagian | B4 | P1 | `/ui-kit#mfa` | Masuk dan MFA ada; pemulihan akun dan penegakan oleh backend belum. |
| PC02 | Lingkup tenant / perusahaan | ERP · platform | Sebagian | B4 | P1 | `/ui-kit#perusahaan` | Pemilih perusahaan ada; isolasi tab A/B dan penolakan lingkup hilang belum. |
| PC03 | Peran, aksi, dan otoritas | ERP · platform | Sebagian | B4 | P1 | `/ui-kit#tanpa-akses` | Tampilan tanpa akses ada; aksi yang mengikuti grant efektif belum. |
| PC04 | Administrasi akun dan akses | ERP · platform | Sebagian | B4 | P1 | — | Daftar pengguna dan undangan contoh ada; pratinjau grant dan cabut akses belum; belum ada demo /ui-kit. |
| PC13 | Notifikasi dan inbox aksi | ERP · platform | Belum | B4 | P1 | — |  |
| PC14 | Job dan penjadwal | ERP · platform | Sebagian | B4 | P1 | `/ui-kit#status` | Status "job berjalan" ada di StateView; daftar job dan dead-letter belum. |
| PC18 | Alur antarperusahaan | ERP · platform | Milik produk | B4 | P1 | — | Dokumen dua sisi dan kompensasi milik domain ERP; UI hanya menampilkan status korelasi. |
| PC19 | KPI dan read model | ERP · platform | Sebagian | B4 | P1 | `/ui-kit#grafik` | KPI dan grafik ada; watermark, stale ≠ nol, dan preview vs official belum. |
| PC20 | Integrasi eksternal | ERP · platform | Milik produk | B4 | P1 | — | Kontrak, dedupe, dan replay milik domain/integrasi; UI hanya status integrasi. |
| PC21 | Operasi dan rilis | ERP · platform | Milik produk | B4 | P1 | — | Health, log, dan alert milik operasi; UI hanya halaman status. |
| PC22 | Retensi dan offboarding | ERP · platform | Milik produk | B4 | P1 | — | Kebijakan retensi milik pemilik data; UI hanya konfirmasi dan status. |
| UI-DAT-002 | Grid enterprise padat yang bisa diedit | AAPM Ecosystem | Belum | B4 | P1 | — |  |
| UI-FND-009 | Pencarian dan command surface | AAPM Ecosystem | Sebagian | B4 | P2 | `/ui-kit#menu` | Palet perintah ada; pencarian berlingkup (scope) dan hasil lintas modul belum. |
