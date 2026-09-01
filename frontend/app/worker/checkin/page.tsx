'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function CheckinPage() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
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
      console.error('Không thể mở Camera:', err);
      setSubmitError('Không thể mở Camera. Vui lòng cấp quyền truy cập máy ảnh trong trình duyệt.');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  };

  // Tự động định vị GPS ngầm dưới nền, không hiển thị cảnh báo ra màn hình
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
          console.warn('Lỗi định vị GPS ngầm (sử dụng tọa độ mặc định):', err);
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
        setPhotoDataUrl(dataUrl);
      }
    }
  };

  const retakePhoto = () => {
    setPhotoDataUrl(null);
  };

  const handleSubmit = async () => {
    if (!photoDataUrl) {
      setSubmitError('Vui lòng chụp ảnh Check-in trực tiếp trước khi gửi.');
      return;
    }

    setLoading(true);
    setSubmitError(null);

    try {
      await apiFetch('/shifts/checkin', {
        method: 'POST',
        body: JSON.stringify({
          lat: location.lat,
          lng: location.lng,
          accuracy: location.accuracy,
          photoUrl: photoDataUrl,
        }),
      });

      stopCamera();
      router.push('/worker');
    } catch (err: any) {
      setSubmitError(err.message || 'Check-in thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-4 max-w-md mx-auto flex flex-col justify-between">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2 border-b border-slate-800">
        <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-white">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-base font-bold text-slate-200 uppercase tracking-wider">Check-in Ca Làm Việc</h1>
        <div className="w-8" />
      </div>

      <main className="my-4 space-y-4">
        {submitError && (
          <div className="p-4 badge-red rounded-xl text-xs font-medium">
            {submitError}
          </div>
        )}

        {/* Live Camera View & Photo Preview */}
        <div className="glass-card p-2 relative overflow-hidden aspect-square rounded-2xl flex items-center justify-center bg-black">
          {!photoDataUrl ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover rounded-xl"
            />
          ) : (
            <img src={photoDataUrl} alt="Check-in Photo" className="w-full h-full object-cover rounded-xl" />
          )}

          <canvas ref={canvasRef} className="hidden" />

          {/* Overlay Guide Ring */}
          {!photoDataUrl && (
            <div className="absolute inset-0 border-2 border-dashed border-purple-500/50 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="text-xs text-purple-300 bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                Giữ khuôn mặt rõ ràng trong khung hình
              </span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-3">
          {!photoDataUrl ? (
            <button
              type="button"
              onClick={takePhoto}
              className="w-full py-4 gradient-button bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center gap-2 text-base font-bold shadow-lg shadow-purple-500/25"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              CHỤP ẢNH CHECK-IN
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={retakePhoto}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-sm transition-colors"
              >
                Chụp Lại Ảnh
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="py-3 px-4 gradient-button font-bold rounded-xl text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                ) : (
                  'XÁC NHẬN GỬI'
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
