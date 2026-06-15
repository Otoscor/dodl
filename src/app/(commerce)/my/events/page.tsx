"use client";

import { BackHeader } from "@/components/layout/BackHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { MOCK_EVENTS } from "../mock";

export default function MyEventsPage() {
  const { showToast } = useToast();
  const events = MOCK_EVENTS;

  return (
    <div className="min-h-screen bg-white">
      <BackHeader title="진행 중인 이벤트" />

      {events.length === 0 ? (
        <EmptyState icon="campaign" title="진행 중인 이벤트가 없습니다" />
      ) : (
        <div className="px-6 pt-4 pb-10 space-y-4">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => showToast("준비 중입니다.", "info")}
              className="block w-full text-left rounded-[10px] overflow-hidden border border-[#e0e0e0]"
            >
              {/* 배너 */}
              <div className="h-28 bg-gradient-to-br from-[#ebebeb] to-[#f5f5f5] flex items-center justify-center">
                <span className="material-icons-outlined text-[36px] text-[#cccccc]">campaign</span>
              </div>
              <div className="p-5">
                <p className="text-[16px] text-text-primary">{event.title}</p>
                <p className="text-[14px] text-[#888] mt-1 leading-relaxed">{event.description}</p>
                <p className="text-[12px] text-text-quaternary mt-3">{event.period}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
