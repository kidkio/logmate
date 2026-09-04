'use client';

import React, { useState } from 'react';
import { Mail, Send, X, Sparkles, CheckCircle2, Heart } from 'lucide-react';
import { Failure } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { getDeviceId } from '@/lib/device';

interface SendComfortNoteModalProps {
  failure: Failure | null;
  isOpen: boolean;
  onClose: () => void;
  onSentSuccess?: () => void;
}

const PRESET_MESSAGES = [
  '오늘 밤은 이불 꼭 덮고 푹 자요 🛌',
  '나도 똑같은 일 있었는데 지나고 나니 다 추억이더라고요 🍀',
  '누구나 실수해요. 당신은 여전히 빛나는 사람이에요 🫂',
  '충분히 잘하고 계세요! 내일은 분명 더 좋은 날이 될 거예요 ✨',
  '실수 좀 하면 어때요! 오늘 밤 훌훌 털어내버려요 🍜',
];

export function SendComfortNoteModal({
  failure,
  isOpen,
  onClose,
  onSentSuccess,
}: SendComfortNoteModalProps) {
  const { user } = useAuth();
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [customText, setCustomText] = useState<string>('');
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen || !failure) return null;

  const currentDeviceId = typeof window !== 'undefined' ? getDeviceId() : '';
  const isSelf = Boolean(
    (user?.id && failure.userId && user.id === failure.userId) ||
    (currentDeviceId && failure.deviceId && currentDeviceId === failure.deviceId)
  );

  const currentMessage = customText.trim() || selectedPreset;

  const handleSend = async () => {
    if (!currentMessage || isSelf) return;

    setIsSending(true);
    try {
      const res = await fetch('/api/comfort-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          failureId: failure.id,
          targetUserId: failure.userId || failure.deviceId,
          fromNickname: user?.nickname || '익명의 이웃',
          message: currentMessage,
          deviceId: currentDeviceId,
        }),
      });

      if (res.ok) {
        setIsDone(true);
        if (onSentSuccess) onSentSuccess();
        setTimeout(() => {
          setIsDone(false);
          setSelectedPreset('');
          setCustomText('');
          onClose();
        }, 1500);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm glass-card rounded-2xl sm:rounded-3xl p-5 border border-pink-500/30 shadow-[0_0_50px_rgba(236,72,153,0.25)] space-y-4 animate-in zoom-in-95 duration-200"
      >
        {isSelf ? (
          <div className="py-6 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(245,158,11,0.3)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">
              내가 작성한 사연입니다
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed px-2">
              나 자신에게 보내는 쪽지는 보낼 수 없습니다.<br />
              다른 이웃들의 사연에 따뜻한 위로와 응원을 건네보세요!
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 py-2 px-5 rounded-xl font-semibold text-xs text-slate-200 bg-white/10 hover:bg-white/20 border border-white/10 transition-all"
            >
              닫기
            </button>
          </div>
        ) : isDone ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-pink-500/20 border border-pink-500/40 text-pink-400 flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(236,72,153,0.4)]">
              <Heart className="w-7 h-7 fill-pink-400" />
            </div>
            <h3 className="text-base font-black text-slate-100">
              따뜻한 온기 쪽지가 전달되었습니다!
            </h3>
            <p className="text-xs text-slate-400">
              {failure.authorNickname || '익명의 친구'}님의 서재로 마음이 전달되었어요.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                    <span>1초 익명 온기 쪽지</span>
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {failure.authorNickname || '익명의 친구'}님에게 따뜻한 한 줄을 선물하세요
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 원클릭 프리셋 칩들 */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-slate-400 font-medium">
                터치하여 바로 고르기:
              </span>
              <div className="space-y-1">
                {PRESET_MESSAGES.map((msg, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedPreset(msg);
                      setCustomText('');
                    }}
                    className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all ${
                      selectedPreset === msg && !customText
                        ? 'bg-pink-500/20 border-pink-400 text-pink-200 shadow-[0_0_12px_rgba(236,72,153,0.3)]'
                        : 'bg-white/[0.03] border-white/[0.06] text-slate-300 hover:bg-white/[0.07]'
                    }`}
                  >
                    {msg}
                  </button>
                ))}
              </div>
            </div>

            {/* 직접 한 줄 쓰기 */}
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 font-medium">
                또는 직접 한마디 적기:
              </span>
              <input
                type="text"
                value={customText}
                onChange={(e) => {
                  setCustomText(e.target.value);
                  setSelectedPreset('');
                }}
                maxLength={60}
                placeholder="마음을 담은 짧은 위로 한 줄..."
                className="w-full bg-[#050713] text-xs text-slate-100 placeholder:text-slate-600 rounded-xl px-3 py-2.5 border border-white/[0.08] focus:border-pink-500/80 outline-none transition-all"
              />
            </div>

            <button
              type="button"
              disabled={isSending || !currentMessage}
              onClick={handleSend}
              className="w-full py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 to-indigo-600 hover:opacity-95 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? '전달하는 중...' : '익명 온기 쪽지 날리기'}</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
