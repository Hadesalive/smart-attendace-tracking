import { DialogBoxDemo } from "@/components/ui/dialog-box";

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Dialog Component Demo
          </h1>
          <p className="text-lg text-gray-600">
            Showcasing the new unified dialog component with Tailwind CSS
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <DialogBoxDemo />
        </div>
      </div>
    </div>
  );
}
