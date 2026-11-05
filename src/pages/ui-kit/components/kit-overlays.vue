<script setup lang="ts">
import { notify } from '@/components/aapm/feedback/notify'
import AapmIcon from '@/components/aapm/icon/AapmIcon.vue'
import { focusFirstInvalid, shake } from '@/components/aapm/motion/motion-blur'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command'
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarMenu, MenubarRadioGroup, MenubarRadioItem, MenubarSeparator, MenubarShortcut, MenubarSub, MenubarSubContent, MenubarSubTrigger, MenubarTrigger } from '@/components/ui/menubar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Progress } from '@/components/ui/progress'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import KitSection from './kit-section.vue'

const filtersOpen = shallowRef(true)
const showColumns = reactive({ lot: true, harga: false })
const sortBy = shallowRef('tanggal')

const formRoot = useTemplateRef<HTMLElement>('formRoot')
const dialogOpen = shallowRef(false)
const supplier = shallowRef('')
const supplierError = shallowRef('')
async function saveSupplier() {
  supplierError.value = supplier.value.trim() ? '' : 'Nama pemasok wajib diisi.'
  if (supplierError.value) {
    await nextTick()
    focusFirstInvalid(formRoot.value)
    await shake(formRoot.value?.closest<HTMLElement>('[role="dialog"]'))
    return
  }
  dialogOpen.value = false
  notify.success('Pemasok disimpan', { description: `${supplier.value} siap dipakai di PO.` })
  supplier.value = ''
}

const blockedRoot = useTemplateRef<HTMLElement>('blockedRoot')
async function blockedAction() {
  await shake(blockedRoot.value)
  notify.blocking('Periode Oktober 2026 sudah dikunci', { description: 'Buka kunci periode lewat Finance sebelum memposting ulang.' })
}

const ctxShowMortality = shallowRef(true)
const ctxDensity = shallowRef('nyaman')
const barShowGrid = shallowRef(true)
const barUnit = shallowRef('kg')

const progress = shallowRef(32)
const loading = shallowRef(true)
</script>

<template>
  <KitSection id="navigasi" eyebrow="Navigasi" title="Tab, akordeon, dan collapsible" description="Indikator tab meluncur ke tab aktif lalu kontennya naik. Akordeon dan collapsible membuka dengan tinggi yang mengalir; chevron berputar mengikuti.">
    <Tabs default-value="ringkasan" class="w-full">
      <div class="max-w-full overflow-x-auto">
        <TabsList>
          <TabsTrigger value="ringkasan">
            Ringkasan
          </TabsTrigger>
          <TabsTrigger value="baris">
            Baris penerimaan
          </TabsTrigger>
          <TabsTrigger value="riwayat">
            Riwayat
          </TabsTrigger>
          <TabsTrigger value="lampiran" disabled>
            Lampiran
          </TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="ringkasan" class="pt-3 text-sm text-muted-foreground">
        GRN-2611-0087 · 2 baris · 7.250,5 kg bahan pakan dari CV Minang Pangan.
      </TabsContent>
      <TabsContent value="baris" class="pt-3 text-sm text-muted-foreground">
        Jagung giling 6.000 kg (JG-2611-04) dan konsentrat layer 1.250,5 kg (KL-2611-11).
      </TabsContent>
      <TabsContent value="riwayat" class="pt-3 text-sm text-muted-foreground">
        Dibuat Yulia Fitri 10.31 · Diajukan 10.42 · Menunggu verifikasi gudang.
      </TabsContent>
    </Tabs>

    <div class="grid gap-6 md:grid-cols-2">
      <Accordion type="single" collapsible default-value="a1" class="w-full">
        <AccordionItem value="a1">
          <AccordionTrigger>Kapan stok berkurang?</AccordionTrigger>
          <AccordionContent>Saat penerimaan diposting, bukan saat draft disimpan. Pratinjau dampak dihitung ulang oleh server.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="a2">
          <AccordionTrigger>Bagaimana jika periode sudah dikunci?</AccordionTrigger>
          <AccordionContent>Tombol posting menjelaskan alasan dan jalur koreksi yang diizinkan; data tidak dikirim.</AccordionContent>
        </AccordionItem>
        <AccordionItem value="a3">
          <AccordionTrigger>Siapa yang bisa membalik dokumen?</AccordionTrigger>
          <AccordionContent>Peran dengan otoritas domain yang sesuai. Pembalikan membuat dokumen baru, tidak menghapus yang lama.</AccordionContent>
        </AccordionItem>
      </Accordion>

      <Collapsible v-model:open="filtersOpen" class="rounded-lg border">
        <CollapsibleTrigger as-child>
          <button type="button" class="flex w-full items-center justify-between px-4 py-3 text-sm font-medium">
            Filter lanjutan
            <AapmIcon name="chevronDown" :size="16" class="transition-transform duration-200 ease-aapm" :class="filtersOpen ? 'rotate-180' : ''" />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div class="grid gap-3 border-t px-4 py-3">
            <div class="grid gap-1.5">
              <Label for="f-pemasok">Pemasok</Label>
              <Input id="f-pemasok" placeholder="Cari pemasok" />
            </div>
            <div class="grid gap-1.5">
              <Label for="f-lot">Lot</Label>
              <Input id="f-lot" placeholder="Contoh: JG-2611" class="font-mono" />
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  </KitSection>

  <KitSection id="overlay" eyebrow="Overlay" title="Dialog, konfirmasi, sheet, popover, menu" description="Dialog naik dengan motion blur bertahap; menu muncul dari sisi pemicunya; submit yang ditolak membuat dialog bergetar dan fokus pindah ke isian bermasalah.">
    <div class="flex flex-wrap gap-2">
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>
            <AapmIcon name="add" :size="16" />
            Tambah pemasok
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah pemasok</DialogTitle>
            <DialogDescription>Pemasok baru tersedia untuk PO setelah disimpan. Kosongkan nama lalu simpan untuk melihat getar.</DialogDescription>
          </DialogHeader>
          <form ref="formRoot" class="grid gap-2" novalidate @submit.prevent="saveSupplier">
            <Label for="sup-name" :data-error="!!supplierError">Nama pemasok</Label>
            <Input id="sup-name" v-model="supplier" :aria-invalid="supplierError ? 'true' : undefined" autocomplete="off" />
            <p v-if="supplierError" data-slot="field-error" class="text-sm text-destructive">
              {{ supplierError }}
            </p>
          </form>
          <DialogFooter>
            <Button variant="outline" @click="dialogOpen = false">
              Batal
            </Button>
            <Button @click="saveSupplier">
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog>
        <AlertDialogTrigger as-child>
          <Button variant="outline">
            <AapmIcon name="submit" :size="16" />
            Posting penerimaan
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Posting GRN-2611-0087?</AlertDialogTitle>
            <AlertDialogDescription>
              PT Agung Abadi Putra Mandiri · Gudang Pakan. Stok bahan pakan bertambah 7.250,5 kg dan dokumen tidak bisa diubah lagi — hanya bisa dibalik.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction @click="notify.success('Diposting', { description: 'GRN-2611-0087 · stok diperbarui.' })">
              Posting
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Sheet>
        <SheetTrigger as-child>
          <Button variant="outline">
            <AapmIcon name="view" :size="16" />
            Detail kandang
          </Button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Kandang B3</SheetTitle>
            <SheetDescription>14.210 ekor · umur 49 minggu · HD 90,6%</SheetDescription>
          </SheetHeader>
          <p class="px-4 text-sm text-muted-foreground">
            Mortalitas minggu ini 0,21%. Pengamatan terakhir: nafsu makan turun di sisi timur.
          </p>
        </SheetContent>
      </Sheet>

      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">
            <AapmIcon name="info" :size="16" />
            Definisi HD
          </Button>
        </PopoverTrigger>
        <PopoverContent class="w-72 text-sm">
          <p class="font-semibold">
            Hen-day (HD)
          </p>
          <p class="mt-1 text-muted-foreground">
            Telur hari ini ÷ populasi hidup hari ini × 100. Tidak dijumlahkan antar kandang — diagregasi dari pembilang dan penyebut.
          </p>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button variant="outline">
            Tampilan
            <AapmIcon name="chevronDown" :size="16" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
          <DropdownMenuLabel>Kolom</DropdownMenuLabel>
          <DropdownMenuCheckboxItem v-model="showColumns.lot">
            Lot
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem v-model="showColumns.harga">
            Harga satuan
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Urutkan</DropdownMenuLabel>
          <DropdownMenuRadioGroup v-model="sortBy">
            <DropdownMenuRadioItem value="tanggal">
              Tanggal
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="pemasok">
              Pemasok
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <AapmIcon name="export" :size="16" />
              Ekspor
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent class="w-44">
              <DropdownMenuItem>
                CSV
                <DropdownMenuShortcut>⌘E</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>Excel (.xlsx)</DropdownMenuItem>
              <DropdownMenuItem>PDF ringkas</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          <DropdownMenuItem>
            <AapmIcon name="print" :size="16" />
            Cetak
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  </KitSection>

  <KitSection id="menu" eyebrow="Menu" title="Menu konteks, menubar, dan palet perintah" description="Semua menu memakai sorotan bergaya sidebar yang meluncur mengikuti keyboard maupun pointer. Item masuk bertahap saat menu dibuka, tanda centang dicap, dan submenu meluncur dari sisinya.">
    <div class="grid gap-6 lg:grid-cols-2">
      <div class="grid content-start gap-3">
        <Menubar class="w-fit max-w-full">
          <MenubarMenu>
            <MenubarTrigger>Berkas</MenubarTrigger>
            <MenubarContent class="w-56">
              <MenubarItem>
                <AapmIcon name="add" :size="16" />
                GRN baru
                <MenubarShortcut>⌘N</MenubarShortcut>
              </MenubarItem>
              <MenubarItem>
                <AapmIcon name="copy" :size="16" />
                Duplikat dokumen
              </MenubarItem>
              <MenubarSeparator />
              <MenubarSub>
                <MenubarSubTrigger>
                  <AapmIcon name="export" :size="16" />
                  Ekspor
                </MenubarSubTrigger>
                <MenubarSubContent class="w-44">
                  <MenubarItem>CSV</MenubarItem>
                  <MenubarItem>Excel (.xlsx)</MenubarItem>
                </MenubarSubContent>
              </MenubarSub>
              <MenubarItem>
                <AapmIcon name="print" :size="16" />
                Cetak
                <MenubarShortcut>⌘P</MenubarShortcut>
              </MenubarItem>
            </MenubarContent>
          </MenubarMenu>
          <MenubarMenu>
            <MenubarTrigger>Tampilan</MenubarTrigger>
            <MenubarContent class="w-52">
              <MenubarCheckboxItem v-model="barShowGrid">
                Garis bantu grafik
              </MenubarCheckboxItem>
              <MenubarSeparator />
              <MenubarRadioGroup v-model="barUnit">
                <MenubarRadioItem value="kg">
                  Satuan kg
                </MenubarRadioItem>
                <MenubarRadioItem value="butir">
                  Satuan butir
                </MenubarRadioItem>
              </MenubarRadioGroup>
            </MenubarContent>
          </MenubarMenu>
        </Menubar>

        <ContextMenu>
          <ContextMenuTrigger class="grid min-h-36 place-items-center rounded-lg border border-dashed px-4 text-center text-sm text-muted-foreground">
            Klik kanan (atau tekan lama) di area ini untuk menu baris GRN-2611-0087
          </ContextMenuTrigger>
          <ContextMenuContent class="w-60">
            <ContextMenuLabel>GRN-2611-0087</ContextMenuLabel>
            <ContextMenuItem>
              <AapmIcon name="view" :size="16" />
              Buka detail
              <ContextMenuShortcut>↵</ContextMenuShortcut>
            </ContextMenuItem>
            <ContextMenuItem>
              <AapmIcon name="edit" :size="16" />
              Ubah draft
            </ContextMenuItem>
            <ContextMenuItem>
              <AapmIcon name="history" :size="16" />
              Riwayat audit
            </ContextMenuItem>
            <ContextMenuSub>
              <ContextMenuSubTrigger>
                <AapmIcon name="share" :size="16" />
                Bagikan ke
              </ContextMenuSubTrigger>
              <ContextMenuSubContent class="w-44">
                <ContextMenuItem>Gudang Pakan</ContextMenuItem>
                <ContextMenuItem>Finance</ContextMenuItem>
                <ContextMenuItem>Manajer Kandang</ContextMenuItem>
              </ContextMenuSubContent>
            </ContextMenuSub>
            <ContextMenuSeparator />
            <ContextMenuCheckboxItem v-model="ctxShowMortality">
              Tampilkan mortalitas
            </ContextMenuCheckboxItem>
            <ContextMenuRadioGroup v-model="ctxDensity">
              <ContextMenuRadioItem value="nyaman">
                Kerapatan nyaman
              </ContextMenuRadioItem>
              <ContextMenuRadioItem value="padat">
                Kerapatan padat
              </ContextMenuRadioItem>
            </ContextMenuRadioGroup>
            <ContextMenuSeparator />
            <ContextMenuItem variant="destructive">
              <AapmIcon name="delete" :size="16" />
              Hapus draft
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      </div>

      <Command class="h-auto rounded-lg border">
        <CommandInput placeholder="Cari perintah atau dokumen…" aria-label="Cari perintah atau dokumen" class="h-9 py-2" />
        <CommandList>
          <CommandEmpty>Tidak ada yang cocok.</CommandEmpty>
          <CommandGroup heading="Dokumen">
            <CommandItem value="grn baru">
              <AapmIcon name="add" :size="16" />
              Buat GRN baru
              <CommandShortcut>⌘N</CommandShortcut>
            </CommandItem>
            <CommandItem value="po pakan">
              <AapmIcon name="procurement" :size="16" />
              PO pakan jagung
            </CommandItem>
            <CommandItem value="transfer telur">
              <AapmIcon name="transfer" :size="16" />
              Transfer telur ke gudang
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Laporan">
            <CommandItem value="produksi harian">
              <AapmIcon name="chart" :size="16" />
              Produksi harian per kandang
            </CommandItem>
            <CommandItem value="stok gudang">
              <AapmIcon name="inventory" :size="16" />
              Posisi stok gudang
            </CommandItem>
            <CommandItem value="cetak">
              <AapmIcon name="print" :size="16" />
              Cetak rekap mingguan
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  </KitSection>

  <KitSection id="umpan-balik" eyebrow="Umpan balik" title="Toast, aksi terblokir, progres, loading" description="Toast meluncur dengan motion blur; toast error bergetar sekali. Aksi yang diblokir menggetarkan permukaannya dan menjelaskan alasannya.">
    <div class="flex flex-wrap gap-2">
      <Button variant="outline" @click="notify.success('Tersimpan', { description: 'Draft GRN-2611-0087 tersimpan di server.' })">
        <AapmIcon name="success" :size="16" />
        Sukses
      </Button>
      <Button variant="outline" @click="notify.info('Ekspor dimulai', { description: 'Anda akan diberi tahu saat berkas siap.' })">
        <AapmIcon name="info" :size="16" />
        Info
      </Button>
      <Button variant="outline" @click="notify.warning('Stok jagung tinggal 3 hari', { description: 'Buat PO sebelum 07/11/2026.' })">
        <AapmIcon name="warning" :size="16" />
        Peringatan
      </Button>
      <Button variant="outline" @click="notify.blocking('Gagal menyimpan', { description: 'Koneksi terputus. Status perubahan belum diketahui.' })">
        <AapmIcon name="danger" :size="16" />
        Error
      </Button>
    </div>
    <div ref="blockedRoot" class="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
      <div class="text-sm">
        <p class="font-medium">
          Posting ulang Oktober 2026
        </p>
        <p class="text-muted-foreground">
          Periode sudah dikunci oleh Finance.
        </p>
      </div>
      <Button variant="outline" @click="blockedAction">
        <AapmIcon name="locked" :size="16" />
        Coba posting
      </Button>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      <div class="grid gap-2">
        <div class="flex justify-between text-sm">
          <span>Impor 1.248 baris</span><span class="numeric">{{ progress }}%</span>
        </div>
        <Progress :model-value="progress" />
        <div class="flex gap-2">
          <Button size="sm" variant="outline" @click="progress = Math.max(0, progress - 18)">
            −
          </Button>
          <Button size="sm" variant="outline" @click="progress = Math.min(100, progress + 18)">
            +
          </Button>
        </div>
      </div>
      <div class="grid gap-2">
        <div class="flex items-center justify-between text-sm">
          <span>Skeleton</span>
          <Button size="sm" variant="ghost" @click="loading = !loading">
            {{ loading ? 'Tampilkan data' : 'Muat ulang' }}
          </Button>
        </div>
        <div v-if="loading" class="grid gap-2">
          <Skeleton class="h-4 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-4 w-2/3" />
        </div>
        <p v-else data-slot="empty-content" class="text-sm text-muted-foreground">
          3 penerimaan menunggu verifikasi gudang hari ini.
        </p>
      </div>
    </div>
  </KitSection>
</template>
