import React from 'react';
import Messages from '../../../components/dashboard/Messages';

export default function MessagesNewPage() {
  return (
    <div className="bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="h-[calc(100vh-8rem)]">
          <Messages />
        </div>
      </div>
    </div>
  );
}