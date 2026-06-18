"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { MOCK_ADDRESSES } from "@/app/(commerce)/my/mock";

// 공용 주소록 모델 — 구조화(우편번호/도로명/상세 분리).
export interface SavedAddress {
  id: string;
  zipcode: string;
  road: string; // 도로명주소
  detail: string; // 상세주소
  recipientName: string;
  recipientPhone: string;
  isDefault: boolean;
}

export type AddressDraft = Omit<SavedAddress, "id">;

interface AddressStore {
  addresses: SavedAddress[];
  addAddress: (draft: AddressDraft) => string; // 반환 id
  updateAddress: (id: string, draft: AddressDraft) => void;
  deleteAddress: (id: string) => void;
  defaultAddress: SavedAddress | null;
}

const STORAGE_KEY = "dodl_addresses";

// 평탄한 MOCK_ADDRESSES → 구조화 모델 (도로명에 통합 주소, zipcode/detail 공란)
function seedFromMock(): SavedAddress[] {
  return MOCK_ADDRESSES.map((a) => ({
    id: a.id,
    zipcode: "",
    road: a.address,
    detail: "",
    recipientName: a.name,
    recipientPhone: a.phone,
    isDefault: !!a.isDefault,
  }));
}

function readStored(): SavedAddress[] {
  if (typeof window === "undefined") return seedFromMock();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return seedFromMock();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return seedFromMock();
    return parsed;
  } catch {
    return seedFromMock();
  }
}

// isDefault가 true인 항목이 들어오면 나머지는 해제 (단일 기본배송지 보장)
function applyDefault(list: SavedAddress[], defaultId: string, isDefault: boolean): SavedAddress[] {
  if (!isDefault) return list;
  return list.map((a) => ({ ...a, isDefault: a.id === defaultId }));
}

const AddressContext = createContext<AddressStore | null>(null);

export function AddressProvider({ children }: { children: React.ReactNode }) {
  const [addresses, setAddresses] = useState<SavedAddress[]>(seedFromMock);
  const [hydrated, setHydrated] = useState(false);

  // 마운트 후 localStorage에서 복원
  useEffect(() => {
    setAddresses(readStored());
    setHydrated(true);
  }, []);

  // 변경 시 저장 (복원 완료 후에만)
  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
  }, [addresses, hydrated]);

  const addAddress = useCallback((draft: AddressDraft) => {
    const id = `ad-${Date.now()}`;
    setAddresses((prev) => {
      const next = [...prev, { id, ...draft }];
      return applyDefault(next, id, draft.isDefault);
    });
    return id;
  }, []);

  const updateAddress = useCallback((id: string, draft: AddressDraft) => {
    setAddresses((prev) => {
      const next = prev.map((a) => (a.id === id ? { id, ...draft } : a));
      return applyDefault(next, id, draft.isDefault);
    });
  }, []);

  const deleteAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) ?? addresses[0] ?? null;

  return (
    <AddressContext.Provider
      value={{ addresses, addAddress, updateAddress, deleteAddress, defaultAddress }}
    >
      {children}
    </AddressContext.Provider>
  );
}

export function useAddresses(): AddressStore {
  const ctx = useContext(AddressContext);
  if (!ctx) throw new Error("useAddresses must be used within AddressProvider");
  return ctx;
}

// "[우편번호] 도로명 상세주소" 형태로 합치기
export function formatAddress(a: SavedAddress): string {
  return `${a.zipcode ? `[${a.zipcode}] ` : ""}${a.road}${a.detail ? ` ${a.detail}` : ""}`;
}
