"use client";

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ConversationSidebar from '../../messages/components/ConversationSidebar';
import ChatWindow from '../../messages/components/ChatWindow';

interface Conversation {
	id: string;
	participants: Array<{
		id: number;
		name: string;
		avatarUrl?: string;
	}>;
	lastMessage?: any;
	updatedAt: string;
}

export default function ChatPage() {
	const params = useParams();
	const conversationId = params.id as string;

	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [currentUser, setCurrentUser] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const token = localStorage.getItem('token');
		if (!token) {
			window.location.href = '/login';
			return;
		}
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			setCurrentUser(payload);
		} catch (err) {
			localStorage.removeItem('token');
			window.location.href = '/login';
			return;
		}

		const checkMobile = () => setIsMobile(window.innerWidth < 768);
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	useEffect(() => {
		if (!currentUser) return;

		const load = async () => {
			try {
				setLoading(true);
				const token = localStorage.getItem('token');
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/api/conversations`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});
				if (response.ok) {
					const data = await response.json();
					setConversations(data.data || []);
				} else {
					throw new Error('Failed to load conversations');
				}
			} catch (err) {
				console.error('Load conversations error:', err);
				setError('Failed to load conversations');
			} finally {
				setLoading(false);
			}
		};

		load();
	}, [currentUser]);

	if (loading) return (
		<div className="flex items-center justify-center h-screen"><div>Loading...</div></div>
	);
	if (error) return (
		<div className="flex items-center justify-center h-screen"><div className="text-red-600">{error}</div></div>
	);

	const currentConversation = conversations.find(c => c.id === conversationId);
	if (!currentConversation) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="text-center">
					<h2 className="text-xl font-semibold">Conversation not found</h2>
					<p className="text-gray-600">Bạn không có quyền truy cập hoặc cuộc trò chuyện không tồn tại.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex h-screen bg-gray-50">
			{!isMobile && (
				<div className="w-80 bg-white border-r border-gray-200 flex flex-col">
					<ConversationSidebar
						conversations={conversations}
						selectedConversation={conversationId}
						onSelectConversation={(id: string) => { window.location.href = `/dashboard/chat/${id}`; }}
						currentUserId={currentUser?.id}
					/>
				</div>
			)}

			<div className="flex-1 flex flex-col">
				<ChatWindow
					conversationId={conversationId}
					currentUserId={currentUser?.id}
					onBack={isMobile ? () => { window.location.href = '/dashboard/messages'; } : undefined}
					conversations={conversations}
				/>
			</div>
		</div>
	);
}
