import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { DialogBox } from '@/components/ui/dialog-box';
import { useAttendance } from '@/lib/domains';

interface SessionQrCodeDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  session: {
    id: string;
    course_name: string;
    session_name: string;
    session_date: string;
    start_time: string;
    end_time: string;
  } | null;
}

export default function SessionQrCodeDialog({ isOpen, onOpenChange, session }: SessionQrCodeDialogProps) {
  const [qrValue, setQrValue] = useState('');
  const attendance = useAttendance();
  const { getSessionTimeStatus } = attendance;

  useEffect(() => {
    if (session) {
      // Generate URL that redirects to attendance page
      const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const attendanceUrl = `${baseUrl}/attend/${session.id}`;
      setQrValue(attendanceUrl);
    }
  }, [session]);

  // Check if session is currently active
  const isSessionActive = session ? getSessionTimeStatus(session as any) === 'active' : false;

  if (!session) return null;

  return (
    <DialogBox
      open={isOpen}
      onOpenChange={onOpenChange}
      title="Attendance QR Code"
      description="Show this QR code to students for attendance marking"
      maxWidth="2xl"
    >
      <div className="px-6 space-y-8">
        {/* Course and Session Info */}
        <div className="text-center space-y-3">
          <h3 className="text-2xl font-bold text-gray-900">{session.course_name}</h3>
          <p className="text-lg text-gray-600">{session.session_name}</p>
          <p className="text-base text-gray-500">
            {new Date(session.session_date).toLocaleDateString()} • {session.start_time} - {session.end_time}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div className={`relative p-4 rounded-xl border-2 shadow-lg ${isSessionActive ? 'bg-white border-green-200' : 'bg-gray-100 border-gray-300'}`}>
            <QRCodeCanvas
              value={qrValue}
              size={250}
              level="M"
              includeMargin={true}
            />
            {!isSessionActive && (
              <div className="absolute inset-0 bg-gray-500 bg-opacity-50 rounded-xl flex items-center justify-center">
                <div className="text-white font-semibold text-lg">
                  {getSessionTimeStatus(session as any) === 'upcoming' ? 'Session Not Started' : 'Session Ended'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={`rounded-lg p-6 space-y-4 ${isSessionActive ? 'bg-green-50' : 'bg-gray-50'}`}>
          <h4 className="text-lg font-semibold text-gray-900 text-center">
            {isSessionActive ? 'Instructions for Students' : 'Session Status'}
          </h4>
          {isSessionActive ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <p>Display this QR code on your screen or projector</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <p>Students can scan it with their camera app</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <p>They'll be automatically redirected to mark attendance</p>
              </div>
              <div className="flex items-start space-x-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">4</span>
                <p>Attendance will be recorded automatically</p>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-lg font-medium text-gray-700">
                {getSessionTimeStatus(session as any) === 'upcoming' 
                  ? '⏰ Session starts at ' + session.start_time 
                  : '✅ Session ended at ' + session.end_time}
              </p>
              <p className="text-sm text-gray-500">
                QR code will only be accessible during the session time
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3 pt-6">
          <button
            onClick={() => onOpenChange(false)}
            className="px-6 py-3 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </DialogBox>
  );
}
