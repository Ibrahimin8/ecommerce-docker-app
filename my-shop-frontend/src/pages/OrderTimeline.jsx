import React from 'react';

export default function OrderTimeline({ histories }) {
  if (!histories || histories.length === 0) return null;

  return (
    <ol className="border-l-2 border-blue-300 ml-3 my-5">
      {histories.map((h, idx) => (
        <li key={h.id} className="mb-4 ml-4">
          <div
            className={
              "absolute w-3 h-3 bg-blue-400 rounded-full mt-1.5 -left-1.5 border border-white"
            }
          />
          <span className="font-bold capitalize">
            {h.status.replace(/-/g, ' ')}
          </span>
          <div className="text-xs text-gray-500">{new Date(h.changedAt).toLocaleString()}</div>
        </li>
      ))}
    </ol>
  );
}