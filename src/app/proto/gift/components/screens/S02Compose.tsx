"use client";

import { useState } from "react";
import { CARD_THEMES, MESSAGE_MAX, PRODUCT, type ContactAccess, type GiftState } from "../../data";
import { Banner, Primary, Screen } from "../wf";
import ContactAccessFlow from "./ContactAccessFlow";

interface Props {
  onBack: () => void;
  onNext: (patch: Partial<GiftState>) => void;
  gift: GiftState;
  access: ContactAccess;
  setAccess: (a: ContactAccess) => void;
  onResetToProduct: () => void;
}

// S-02 · 선물하기 (카드 테마 + 메시지 + 받는 분) — 캡처 3·4·5.
export default function S02Compose({ onBack, onNext, gift, access, setAccess, onResetToProduct }: Props) {
  const [themeId, setThemeId] = useState(gift.cardThemeId || CARD_THEMES[0].id);
  const [message, setMessage] = useState(gift.message);
  const [multiSend, setMultiSend] = useState(gift.multiSend);
  const [name, setName] = useState(gift.receiverName ?? "");
  const [phone, setPhone] = useState(gift.receiverPhone ?? "");
  const [source, setSource] = useState<GiftState["contactSource"]>(gift.contactSource ?? "직접입력");
  const [flowOpen, setFlowOpen] = useState(false);

  const valid = name.trim().length > 0 && phone.trim().length >= 9;

  return (
    <Screen>
      <div className="flex h-[48px] items-center gap-[10px] border-b border-[#ececec] px-[14px]">
        <button type="button" aria-label="뒤로" onClick={onBack} className="text-[16px] text-[#9a9a9a]">‹</button>
        <p className="flex-1 text-center text-[14px] font-bold text-[#333]">선물하기</p>
        <span className="text-[14px] text-[#9a9a9a]">✕</span>
      </div>

      <div className="flex flex-1 flex-col gap-[16px] p-[16px]">
        {/* 카드 미리보기 + 메시지 */}
        <div className="rounded-[10px] border border-[#d4d4d4] p-[14px]">
          <div className="wf-img mx-auto mb-[10px] size-[56px] rounded-[6px]" />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value.slice(0, MESSAGE_MAX))}
            placeholder="선물 메시지를 입력하세요"
            rows={3}
            className="w-full resize-none border-0 text-center text-[13px] leading-[1.6] text-[#333] outline-none placeholder:text-[#bcbcbc]"
          />
          <p className="text-right text-[11px] text-[#9a9a9a]">
            {message.length} / {MESSAGE_MAX}자
          </p>
        </div>

        {/* 카드 테마 */}
        <div className="flex items-start justify-between">
          <div className="flex gap-[12px]">
            {CARD_THEMES.map((t) => {
              const on = themeId === t.id;
              return (
                <button key={t.id} type="button" onClick={() => setThemeId(t.id)} className="flex flex-col items-center gap-[4px]">
                  <span
                    className={`flex size-[36px] items-center justify-center rounded-full border ${
                      on ? "border-[#2f2f2f] bg-[#2f2f2f] text-white" : "border-[#c9c9c9] bg-[#f0f0f0] text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={`text-[11px] ${on ? "font-bold text-[#333]" : "text-[#9a9a9a]"}`}>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 여러 명에게 선물하기 */}
        <button type="button" onClick={() => setMultiSend((v) => !v)} className="flex items-center justify-end gap-[8px]">
          <span className="text-[12px] text-[#6b6b6b]">여러 명에게 선물하기</span>
          <span className={`flex h-[22px] w-[38px] items-center rounded-full p-[2px] ${multiSend ? "justify-end bg-[#2f2f2f]" : "justify-start bg-[#d4d4d4]"}`}>
            <span className="size-[18px] rounded-full bg-white" />
          </span>
        </button>

        {/* 받는 분 */}
        <div className="border-t border-[#ececec] pt-[14px]">
          <button type="button" onClick={() => setFlowOpen(true)} className="flex w-full items-center justify-between">
            <span className="text-[13px] font-bold text-[#333]">받는 분</span>
            <span className="text-[12px] text-[#9a9a9a]">연락처 찾기 ›</span>
          </button>
          <label className="mt-[10px] flex flex-col gap-[6px]">
            <span className="text-[12px] text-[#9a9a9a]">이름</span>
            <input
              value={name}
              onChange={(e) => { setName(e.target.value); setSource("직접입력"); }}
              placeholder="받는 분"
              className="h-[40px] rounded-[8px] border border-[#c9c9c9] px-[12px] text-[14px] text-[#333] outline-none focus:border-[#2f2f2f]"
            />
          </label>
          <label className="mt-[10px] flex flex-col gap-[6px]">
            <span className="text-[12px] text-[#9a9a9a]">휴대 전화 번호</span>
            <input
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setSource("직접입력"); }}
              inputMode="numeric"
              placeholder="000-0000-0000"
              className="h-[40px] rounded-[8px] border border-[#c9c9c9] px-[12px] text-[14px] text-[#333] outline-none focus:border-[#2f2f2f]"
            />
          </label>
        </div>

        <Banner>선물은 결제 완료 후 카카오 알림톡으로 발송되며, 입력된 이름 그대로 수신자 메시지에 표시됩니다.</Banner>
      </div>

      <div className="mt-auto p-[16px]">
        <Primary
          disabled={!valid}
          onClick={() =>
            onNext({ cardThemeId: themeId, message, multiSend, receiverName: name.trim(), receiverPhone: phone.trim(), contactSource: source })
          }
        >
          결제 및 선물하기
        </Primary>
      </div>

      {/* 연락처 찾기(외부 API) — 연락처 접근 권한 게이트 */}
      {flowOpen && (
        <ContactAccessFlow
          initialView={access === "full" ? "appList" : "permModal"}
          access={access}
          setAccess={setAccess}
          onImport={(n, p) => { setName(n); setPhone(p); setSource("주소록"); setFlowOpen(false); }}
          onResetToProduct={onResetToProduct}
          onClose={() => setFlowOpen(false)}
        />
      )}

      {/* 상품 참고(하단 고정 아님) */}
      <span className="sr-only">{PRODUCT.name}</span>
    </Screen>
  );
}
