"use client"

import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface SessionQrCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: { id: string; course_name: string; course_code: string } | null;
}

export default function SessionQrCodeDialog({ isOpen, onOpenChange, session }: SessionQrCodeDialogProps) {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    if (session) {
      // Construct a URL that the student's app can parse.
      // Using the current window origin makes it work across different environments (dev, prod).
      const url = `${window.location.origin}/attend?session_id=${session.id}`;
      setQrValue(url);
    }
  }, [session]);

  if (!session) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-center">
        <DialogHeader>
          <DialogTitle className="text-2xl">Scan to Mark Attendance</DialogTitle>
          <DialogDescription>
            {session.course_code} - {session.course_name}
          </DialogDescription>
        </DialogHeader>
        <div className="p-4 bg-white rounded-lg inline-block mx-auto my-4">
          {qrValue ? (
            <QRCodeCanvas value={qrValue} size={256} />
          ) : (
            <p>Generating QR Code...</p>
          )}
        </div>
        <p className="text-muted-foreground">
          Students can now scan this code with the app to mark their attendance.
        </p>
      </DialogContent>
    </Dialog>
  );
}
