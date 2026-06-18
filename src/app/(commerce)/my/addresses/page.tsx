"use client";

import { useState } from "react";
import { BackHeader } from "@/components/layout/BackHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { AddressPickerOverlay } from "@/components/commerce/AddressPickerOverlay";
import { useAddresses, formatAddress } from "@/hooks/useAddresses";

export default function MyAddressesPage() {
  const { showToast } = useToast();
  const { addresses, deleteAddress } = useAddresses();
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openAdd = () => { setEditingId(null); setOverlayOpen(true); };
  const openEdit = (id: string) => { setEditingId(id); setOverlayOpen(true); };

  const handleDelete = (id: string) => {
    deleteAddress(id);
    showToast("배송지를 삭제했습니다.");
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      <BackHeader title="배송지 관리" />

      {addresses.length === 0 ? (
        <EmptyState
          icon="location_on"
          title="등록된 배송지가 없습니다"
          action={<Button variant="secondary" onClick={openAdd}>배송지 추가</Button>}
        />
      ) : (
        <>
          <div className="divide-y divide-border-subtle">
            {addresses.map((addr) => (
              <div key={addr.id} className="px-6 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[15px] text-text-primary">{addr.recipientName}</span>
                  {addr.isDefault && <Badge variant="red">기본 배송지</Badge>}
                </div>
                <p className="text-[14px] text-text-tertiary">{addr.recipientPhone}</p>
                <p className="text-[14px] text-[#888] mt-1 leading-relaxed">{formatAddress(addr)}</p>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openEdit(addr.id)} className="px-3 py-1.5 text-[13px] rounded-[10px] border border-[#e0e0e0] bg-[#f5f5f5] text-[#888]">
                    수정
                  </button>
                  <button onClick={() => handleDelete(addr.id)} className="px-3 py-1.5 text-[13px] rounded-[10px] border border-[#e0e0e0] bg-[#f5f5f5] text-[#888]">
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="px-6 pt-5">
            <Button variant="secondary" fullWidth size="lg" onClick={openAdd}>
              + 배송지 추가
            </Button>
          </div>
        </>
      )}

      <AddressPickerOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        mode="form"
        editId={editingId}
      />
    </div>
  );
}
