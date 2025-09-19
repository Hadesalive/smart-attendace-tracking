import React, { useState, ChangeEvent, FC, ReactNode } from 'react';
import { cn } from "@/lib/utils";

interface DialogBoxProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
}

export const DialogBox: FC<DialogBoxProps> = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
  maxWidth = 'md'
}) => {
  const handleClose = () => onOpenChange(false);

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    '6xl': 'max-w-6xl',
    '7xl': 'max-w-7xl'
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className={cn(
        "bg-white rounded-2xl shadow-2xl w-full relative text-neutral-900 animate-fadeIn max-h-[90vh] overflow-y-auto",
        maxWidthClasses[maxWidth],
        className
      )}>
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 text-2xl focus:outline-none focus:ring-2 focus:ring-neutral-400 z-10"
          aria-label="Close"
        >
          &times;
        </button>
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-2xl font-bold mb-1 tracking-tight">{title}</h2>
          {description && (
            <p className="text-neutral-500 mb-6 text-sm">{description}</p>
          )}
        </div>
        <div className="pb-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Demo component for testing
export const DialogBoxDemo = () => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('John Doe');
  const [username, setUsername] = useState('@johndoe');

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => setName(e.target.value);
  const handleUsernameChange = (e: ChangeEvent<HTMLInputElement>) => setUsername(e.target.value);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleSave = () => {
    // Save logic here
    setOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 w-full">
      <button
        type="button"
        onClick={handleOpen}
        className="px-6 py-2 rounded-lg bg-neutral-900 text-white font-medium shadow transition hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        Edit Profile
      </button>
      <DialogBox
        open={open}
        onOpenChange={setOpen}
        title="Edit profile"
        description="Make changes to your profile here. Click save when you're done."
      >
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} autoComplete="off">
          <div className="mb-5">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300 focus:outline-none transition"
              autoComplete="off"
              required
            />
          </div>
          <div className="mb-8">
            <label htmlFor="username" className="block text-sm font-semibold mb-2">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={handleUsernameChange}
              className="w-full px-3 py-2 rounded-lg border border-neutral-300 bg-neutral-50 text-neutral-900 focus:border-neutral-500 focus:ring-2 focus:ring-neutral-300 focus:outline-none transition"
              autoComplete="off"
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-neutral-300 bg-white text-neutral-700 font-medium hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-neutral-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-neutral-900 text-white font-semibold shadow hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 transition"
            >
              Save changes
            </button>
          </div>
        </form>
      </DialogBox>
    </div>
  );
};
