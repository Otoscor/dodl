"use client";

import { useState } from "react";
import { API_CONTACTS, DEVICE_CONTACTS, type Contact, type ContactAccess } from "../../data";

type View = "permModal" | "settings" | "limitedPicker" | "appList" | "profile";

interface Props {
  initialView: View;
  access: ContactAccess;
  setAccess: (a: ContactAccess) => void;
  onImport: (name: string, phone: string) => void;
  onResetToProduct: () => void;
  onClose: () => void;
}

const APP = "두들";

function SettingsOption({ label, sub, checked, onClick }: { label: string; sub?: string; checked: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between border-b border-[#ececec] px-[14px] py-[12px] text-left last:border-b-0">
      <span>
        <span className="block text-[14px] text-[#333]">{label}</span>
        {sub && <span className="block text-[11px] text-[#9a9a9a]">{sub}</span>}
      </span>
      {checked && <span className="text-[14px] font-bold text-[#2f2f2f]">✓</span>}
    </button>
  );
}

function OsBar({ title, onBack, right }: { title: string; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex h-[44px] items-center px-[12px]">
      {onBack ? (
        <button type="button" aria-label="뒤로" onClick={onBack} className="flex size-[28px] items-center justify-center rounded-full bg-[#ececec] text-[14px] text-[#4b4b4b]">‹</button>
      ) : (
        <span className="size-[28px]" />
      )}
      <p className="flex-1 text-center text-[14px] font-bold text-[#333]">{title}</p>
      <span className="flex min-w-[28px] justify-end">{right}</span>
    </div>
  );
}

// 연락처 접근 권한 게이트 (iOS 스타일) — 무채색 와이어프레임.
export default function ContactAccessFlow({
  initialView,
  access,
  setAccess,
  onImport,
  onResetToProduct,
  onClose,
}: Props) {
  const [view, setView] = useState<View>(initialView);
  const [limitedPick, setLimitedPick] = useState<string | null>(null);
  const [profile, setProfile] = useState<Contact | null>(null);

  const limitedCount = access === "limited" ? 1 : 0;

  function settingsBack() {
    if (access === "limited") onResetToProduct(); // 제한된 접근 = 실패 → 상품으로 리셋
    else onClose(); // full / none → 선물하기 복귀
  }

  // ── 권한 안내 모달 ──
  if (view === "permModal") {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.35)] px-[28px]">
        <div className="w-full rounded-[14px] bg-white">
          <div className="px-[20px] py-[20px] text-center">
            <p className="text-[13px] leading-[1.6] text-[#333]">
              설정 &gt; 개인정보 보호 &gt; 연락처
              <br />
              설정 &gt; {APP}에서 연락처 접근을
              <br />
              허용해 주세요.
            </p>
          </div>
          <div className="flex border-t border-[#e5e5e5] text-[14px] font-bold">
            <button type="button" onClick={onClose} className="flex-1 border-r border-[#e5e5e5] py-[12px] text-[#6b6b6b]">닫기</button>
            <button type="button" onClick={() => setView("settings")} className="flex-1 py-[12px] text-[#2f2f2f]">설정</button>
          </div>
        </div>
      </div>
    );
  }

  // ── OS 연락처 접근 설정 ──
  if (view === "settings") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-[#f4f4f4]">
        <OsBar title="연락처" onBack={settingsBack} />
        <div className="flex-1 overflow-y-auto p-[14px]">
          <p className="mb-[6px] text-[11px] text-[#9a9a9a]">연락처 접근</p>
          <div className="overflow-hidden rounded-[10px] border border-[#e0e0e0] bg-white">
            <SettingsOption label="없음" checked={access === "none"} onClick={() => setAccess("none")} />
            <SettingsOption label="제한된 접근" sub={`${limitedCount}개의 연락처가 선택됨`} checked={access === "limited"} onClick={() => setView("limitedPicker")} />
            <SettingsOption label="전체 접근" sub="n개의 연락처" checked={access === "full"} onClick={() => setAccess("full")} />
          </div>
          <p className="mt-[8px] px-[4px] text-[11px] leading-[1.5] text-[#9a9a9a]">
            연락처 정보에 전화번호, 이메일, 집 주소 등이 포함될 수 있습니다.
          </p>
          <button type="button" className="mt-[16px] w-full rounded-[10px] border border-[#e0e0e0] bg-white px-[14px] py-[12px] text-left text-[14px] text-[#4b4b4b]">
            선택한 연락처 편집
          </button>
          <div className="mt-[16px] rounded-[10px] border border-[#e0e0e0] bg-white px-[14px] py-[12px]">
            <p className="text-[14px] text-[#333]">비공개 접근</p>
            <p className="mt-[4px] text-[11px] leading-[1.5] text-[#9a9a9a]">
              이 앱은 사용자의 연락처를 표시할 수 있지만, 오직 사용자가 선택한 연락처에만 접근할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── 제한된 접근: 기기 연락처 선택 피커 ──
  if (view === "limitedPicker") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-[#f4f4f4]">
        <p className="px-[14px] pt-[10px] text-center text-[11px] text-[#9a9a9a]">
          ‘{APP}’ 앱이 접근할 수 있는 연락처를 관리합니다.
        </p>
        <OsBar
          title="연락처"
          onBack={() => setView("settings")}
          right={
            <button
              type="button"
              aria-label="완료"
              onClick={() => { setAccess("limited"); setView("settings"); }}
              className="flex size-[24px] items-center justify-center rounded-full bg-[#2f2f2f] text-[12px] text-white"
            >
              ✓
            </button>
          }
        />
        <div className="mx-[14px] mb-[8px] flex h-[34px] items-center rounded-[8px] bg-white px-[10px] text-[12px] text-[#b0b0b0]">🔍 검색</div>
        <div className="flex-1 overflow-y-auto bg-white">
          {DEVICE_CONTACTS.map((c) => {
            const on = limitedPick === c;
            return (
              <button key={c} type="button" onClick={() => setLimitedPick(c)} className="flex w-full items-center gap-[12px] border-b border-[#f0f0f0] px-[14px] py-[12px] text-left">
                <span className={`flex size-[18px] items-center justify-center rounded-full border ${on ? "border-[#2f2f2f]" : "border-[#c9c9c9]"}`}>
                  {on && <span className="size-[10px] rounded-full bg-[#2f2f2f]" />}
                </span>
                <span className="text-[14px] text-[#333]">{c}</span>
              </button>
            );
          })}
        </div>
        <p className="py-[10px] text-center text-[12px] text-[#9a9a9a]">연락처 선택</p>
      </div>
    );
  }

  // ── 전체 접근: 앱 연락처 목록 ──
  if (view === "appList") {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white">
        <OsBar title="연락처" onBack={onClose} right={<button type="button" aria-label="닫기" onClick={onClose} className="text-[14px] text-[#9a9a9a]">✕</button>} />
        <div className="flex-1 overflow-y-auto">
          {API_CONTACTS.map((c) => (
            <button key={c.id} type="button" onClick={() => { setProfile(c); setView("profile"); }} className="flex w-full items-center gap-[14px] border-b border-[#f0f0f0] px-[16px] py-[16px] text-left">
              <span className="wf-img size-[40px] shrink-0 rounded-full" />
              <span className="text-[16px] text-[#333]">{c.name}</span>
            </button>
          ))}
        </div>
        <div className="m-[14px] flex h-[36px] items-center rounded-[10px] bg-[#f0f0f0] px-[12px] text-[13px] text-[#b0b0b0]">🔍 검색</div>
      </div>
    );
  }

  // ── 연락처 상세 → 선택 ──
  if (view === "profile" && profile) {
    return (
      <div className="absolute inset-0 z-50 flex flex-col bg-white">
        <OsBar onBack={() => setView("appList")} title="" />
        <div className="flex flex-col items-center gap-[10px] px-[16px] pb-[16px] pt-[8px]">
          <span className="wf-img size-[88px] rounded-full" />
          <p className="text-[18px] font-bold text-[#333]">{profile.name}</p>
        </div>
        <div className="flex flex-col gap-[10px] px-[16px]">
          <button type="button" onClick={() => onImport(profile.name, profile.phone)} className="flex flex-col rounded-[10px] border border-[#e0e0e0] bg-[#f7f7f7] px-[14px] py-[12px] text-left">
            <span className="text-[11px] text-[#9a9a9a]">전화번호</span>
            <span className="text-[15px] font-bold text-[#333]">{profile.phone}</span>
          </button>
          <div className="rounded-[10px] border border-[#e0e0e0] px-[14px] py-[12px] text-[14px] text-[#bcbcbc]">Game Center에 친구 추가</div>
          <div className="rounded-[10px] border border-[#e0e0e0] px-[14px] py-[12px] text-[14px] text-[#bcbcbc]">나의 위치 공유</div>
        </div>
        <div className="mt-auto p-[16px]">
          <button type="button" onClick={() => onImport(profile.name, profile.phone)} className="h-[46px] w-full rounded-[8px] bg-[#2f2f2f] text-[14px] font-bold text-white">
            이 연락처로 선물하기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
