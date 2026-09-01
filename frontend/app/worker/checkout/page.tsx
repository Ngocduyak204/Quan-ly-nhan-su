'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [step, setStep] = useState<'CHECKOUT_PHOTO' | 'VOLUME_INPUT' | 'PROOF_PHOTO'>('CHECKOUT_PHOTO');

  const [checkoutPhoto, setCheckoutPhoto] = useState<string | null>(null);
  const [volumeProofPhoto, setVolumeProofPhoto] = useState<string | null>(null);
  const [volumeKg, setVolumeKg] = useState<string>('');

  const [location, setLocation] = useState<{ lat: number; lng: number; accuracy: number }>({
    lat: 11.9404,
    lng: 108.4583,
    accuracy: 10,
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    startCamera();
    captureLocationSilent();

    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Lỗi Camera:', err);
      setSubmitError('Không thể mở Camera. Vui lòng cấp quyền truy cập máy ảnh.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Lấy vị trí GPS ngầm dưới nền, không hiển thị bất kỳ cảnh báo đỏ/vàng nào lên màn hình
  const captureLocationSilent = () => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy),
          });
        },
        (err) => {
          console.warn('Lỗi định vị GPS Check-out ngầm (sử dụng tọa độ mặc định):', err);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

        if (step === 'CHECKOUT_PHOTO') {
          setCheckoutPhoto(dataUrl);
          setStep('VOLUME_INPUT');
        } else if (step === 'PROOF_PHOTO') {
          setVolumeProofPhoto(dataUrl);
        }
      }
    }
  };

  const handleSubmit = async () => {
    if (!checkoutPhoto || !volumeProofPhoto || !volumeKg || parseFloat(volumeKg) <= 0) {
      setSubmitError('Vui lòng hoàn thành đủ 3 bước: Ảnh Check-out, Nhập sản lượng và Ảnh minh chứng.');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await apiFetch('/shifts/checkout', {
        method: 'POST',
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          photoUrl: checkoutPhoto,
          outputVolumeKg: parseFloat(volumeKg),
          volumeProofPhotoUrl: volumeProofPhoto,
        }),
      });

      stopCamera();
      router.push('/worker');
    } catch (err: any) {
      setSubmitError(err.message || 'Check-out thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-slate-200 uppercase tracking-wider">Check-out & Báo Sản Lượng</h1>
        <div className="w-8" />
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-2 my-2 text-xs font-semibold">
        <span className={`px-3 py-1 rounded-full ${step === 'CHECKOUT_PHOTO' ? 'badge-amber' : 'bg-slate-800 text-slate-400'}`}>
          1. Ảnh Check-out
        </span>
        <span className={`px-3 py-1 rounded-full ${step === 'VOLUME_INPUT' ? 'badge-amber' : 'bg-slate-800 text-slate-400'}`}>
          2. Nhập kg
        </span>
        <span className={`px-3 py-1 rounded-full ${step === 'PROOF_PHOTO' ? 'badge-amber' : 'bg-slate-800 text-slate-400'}`}>
          3. Ảnh minh chứng
        </span>
      </div>

      <main className="my-2 space-y-4">
        {submitError && (
          <div className="p-3 badge-red rounded-xl text-xs font-medium">
            {submitError}
          </div>
        )}

        {/* Step 1 & 3: Camera Capture View */}
        {(step === 'CHECKOUT_PHOTO' || step === 'PROOF_PHOTO') && (
          <div className="glass-card p-2 relative overflow-hidden aspect-square rounded-2xl flex items-center justify-center bg-black">
            {step === 'CHECKOUT_PHOTO' && !checkoutPhoto && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />
            )}
            {step === 'CHECKOUT_PHOTO' && checkoutPhoto && (
              <img src={checkoutPhoto} alt="Checkout Photo" className="w-full h-full object-cover rounded-xl" />
            )}

            {step === 'PROOF_PHOTO' && !volumeProofPhoto && (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover rounded-xl" />
            )}
            {step === 'PROOF_PHOTO' && volumeProofPhoto && (
              <img src={volumeProofPhoto} alt="Proof Photo" className="w-full h-full object-cover rounded-xl" />
            )}

            <canvas ref={canvasRef} className="hidden" />

            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-sm text-xs font-bold text-amber-300 px-3 py-1 rounded-full">
              {step === 'CHECKOUT_PHOTO' ? 'Chụp ảnh Check-out' : 'Chụp ảnh minh chứng sản lượng (Cân/Bao)'}
            </div>
          </div>
        )}

        {/* Step 2: Volume Input */}
        {step === 'VOLUME_INPUT' && (
          <div className="glass-card p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200">Nhập Sản Lượng Đạt Được Trong Ca</h3>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Sản lượng (tính theo kg)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  required
                  value={volumeKg}
                  onChange={(e) => setVolumeKg(e.target.value)}
                  placeholder="Ví dụ: 1250"
                  className="w-full px-4 py-4 bg-slate-900 border border-slate-700 rounded-xl text-3xl font-extrabold text-blue-400 placeholder-slate-600 focus:outline-none focus:border-purple-500"
                />
                <span className="absolute right-4 top-5 text-base font-bold text-slate-400">kg</span>
              </div>
            </div>

            <button
              type="button"
              disabled={!volumeKg || parseFloat(volumeKg) <= 0}
              onClick={() => setStep('PROOF_PHOTO')}
              className="w-full py-3.5 gradient-button font-bold text-base rounded-xl disabled:opacity-50"
            >
              CHỤP ẢNH MINH CHỨNG SẢN LƯỢNG ➔
            </button>
          </div>
        )}

        {/* Controls for Camera Steps */}
        {step === 'CHECKOUT_PHOTO' && (
          <button
            type="button"
            onClick={takePhoto}
            className="w-full py-4 gradient-button bg-gradient-to-r from-amber-500 to-purple-600 font-bold text-base rounded-xl flex items-center justify-center gap-2"
          >
            CHỤP ẢNH CHECK-OUT ➔
          </button>
        )}

        {step === 'PROOF_PHOTO' && (
          <div className="space-y-3">
            {!volumeProofPhoto ? (
              <button
                type="button"
                onClick={takePhoto}
                className="w-full py-4 gradient-button bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-base rounded-xl flex items-center justify-center gap-2"
              >
                CHỤP ẢNH MINH CHỨNG ➔
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setVolumeProofPhoto(null)}
                  className="py-3 bg-slate-800 text-slate-300 font-semibold rounded-xl text-sm"
                >
                  Chụp Lại Ảnh
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="py-3 gradient-button font-bold rounded-xl text-sm flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    'HOÀN THÀNH CA'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
