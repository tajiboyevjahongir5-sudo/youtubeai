import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  Copy, 
  Check, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck, 
  X,
  RefreshCw,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { getWorkspaceId } from '../lib/workspace';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedCard, setCopiedCard] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds

  const wsId = getWorkspaceId();

  // Create or load invoice
  const initInvoice = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/workspaces/${wsId}/billing/create-invoice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-workspace-id': wsId },
        body: JSON.stringify({ workspaceId: wsId }),
      });
      const data = await res.json();
      if (data.success) {
        setInvoice(data.invoice);
        setPaymentDetails(data.paymentDetails);
        
        // Calculate remaining seconds based on expiresAt
        if (data.invoice?.expiresAt) {
          const diff = Math.max(0, Math.floor((new Date(data.invoice.expiresAt).getTime() - Date.now()) / 1000));
          setTimeLeft(diff);
        }
      }
    } catch (e) {
      console.error('Invoice error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setIsPaid(false);
      initInvoice();
    }
  }, [isOpen]);

  // Countdown timer
  useEffect(() => {
    if (!isOpen || isPaid || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, isPaid, timeLeft]);

  // Polling to check if invoice is paid via CardXabar / HumoCard
  useEffect(() => {
    if (!isOpen || !invoice?.id || isPaid) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/workspaces/${wsId}/billing/check-invoice/${invoice.id}`, {
          headers: { 'x-workspace-id': wsId },
        });
        const data = await res.json();
        if (data.success && data.isPaid) {
          setIsPaid(true);
          clearInterval(pollInterval);
          if (onSuccess) onSuccess();
        }
      } catch (e) {}
    }, 4000);

    return () => clearInterval(pollInterval);
  }, [isOpen, invoice, isPaid, wsId, onSuccess]);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, type: 'card' | 'amount') => {
    navigator.clipboard.writeText(text);
    if (type === 'card') {
      setCopiedCard(true);
      setTimeout(() => setCopiedCard(false), 2000);
    } else {
      setCopiedAmount(true);
      setTimeout(() => setCopiedAmount(false), 2000);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg liquid-glass-red border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-white overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <Zap size={22} className="fill-red-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Jpilot PRO Obuna</h3>
              <p className="text-xs text-gray-400">Oylik to'liq avtopilot va cheksiz video generatsiya</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        {isPaid ? (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.5)]">
              <CheckCircle2 size={36} />
            </div>
            <h4 className="text-2xl font-black text-white">To'lov Muvaffaqiyatli Qabul Qilindi!</h4>
            <p className="text-sm text-gray-300 max-w-sm mx-auto">
              Sizning 30 kunlik Jpilot PRO obunangiz avtomatik faollashtirildi. Barcha cheklovlar olib tashlandi.
            </p>
            <Button variant="primary" onClick={onClose} className="w-full mt-4">
              Davom etish
            </Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Price badge */}
            <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block font-medium">Oylik obuna narxi:</span>
                <div className="text-2xl font-black text-white">
                  {invoice ? `${invoice.totalAmount.toLocaleString()} UZS` : '60 000 UZS'}
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 px-2.5 py-1 rounded-full border border-emerald-500/30">
                  30 kunlik kirish
                </span>
                <span className="text-[11px] text-gray-400 block mt-1">Avtomat tasdiqlash</span>
              </div>
            </div>

            {/* Unique amount notice */}
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <AlertCircle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-200/90 leading-relaxed">
                <strong>MUHIM QOIDA:</strong> Iltimos, kartaga aynan{' '}
                <span className="font-mono font-black text-white underline">
                  {invoice?.totalAmount ? `${invoice.totalAmount.toLocaleString()} UZS` : '60 0xx UZS'}
                </span>{' '}
                o'tkazing! 1 dan 99 so'mgacha unikal qo'shimcha to'lovingizni tizim avtomatik (CardXabar/HumoCard) tanib olishi uchun zarur.
              </div>
            </div>

            {/* Card details box */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-300">Administrator Karta Raqami (Uzcard / Humo):</label>
                <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/15">
                  <div className="flex items-center gap-2.5">
                    <CreditCard size={18} className="text-red-400" />
                    <span className="font-mono text-base font-bold text-white tracking-wider">
                      {paymentDetails?.cardNumber || '8600 0000 0000 0000'}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard((paymentDetails?.cardNumber || '').replace(/\s/g, ''), 'card')}
                    className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 font-semibold bg-white/5 px-2.5 py-1 rounded-lg border border-white/10"
                  >
                    {copiedCard ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedCard ? 'Nusxalandi' : 'Nusxa'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 px-1">
                <span>Karta egasi: <strong className="text-gray-200">{paymentDetails?.cardHolder || 'ADMINISTRATOR'}</strong></span>
                <span className="flex items-center gap-1 font-mono text-amber-400 font-semibold">
                  <Clock size={13} /> Vaqt: {timeFormatted}
                </span>
              </div>

              {/* Exact Amount Copy Button */}
              <div className="pt-1">
                <button
                  onClick={() => copyToClipboard(String(invoice?.totalAmount || 60000), 'amount')}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-red-600/10 border border-red-500/30 hover:bg-red-600/20 transition-all text-xs"
                >
                  <span className="text-gray-300 font-medium">To'lov summasidan nusxa olish:</span>
                  <span className="font-mono font-bold text-red-300 flex items-center gap-1.5">
                    {invoice?.totalAmount ? `${invoice.totalAmount.toLocaleString()} UZS` : '60 000 UZS'}
                    {copiedAmount ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  </span>
                </button>
              </div>
            </div>

            {/* Waiting status */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <RefreshCw size={15} className="text-red-400 animate-spin" />
                <span className="text-gray-300">To'lov kutilmoqda (avtomatik tekshiruv)...</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">Har 4 soniyada</span>
            </div>

            <div className="text-[11px] text-gray-400 text-center leading-tight">
              To'lovni amalga oshirishingiz bilan ushbu oyna avtomatik tarzda yangilanadi. Sahifani yopishingiz shart emas.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
