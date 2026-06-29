import { useState } from 'react';

interface GuideCardProps {
  title: string;
  steps: string[];
}

export default function GuideCard({ title, steps }: GuideCardProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg shadow-sm mb-6">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <span className="text-xl">💡</span>
          <h3 className="font-bold text-blue-800">{title}</h3>
        </div>
        <button 
          onClick={() => setIsOpen(false)}
          className="text-blue-400 hover:text-blue-600 text-xl leading-none"
        >
          &times;
        </button>
      </div>
      <ol className="mt-3 space-y-1 text-sm text-blue-700 list-decimal list-inside">
        {steps.map((step, index) => (
          <li key={index}>{step}</li>
        ))}
      </ol>
    </div>
  );
}